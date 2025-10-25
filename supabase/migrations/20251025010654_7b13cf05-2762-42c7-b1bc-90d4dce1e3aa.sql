-- Criar tabela de enrollments de garantia
CREATE TABLE IF NOT EXISTS public.guarantee_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  purchase_id TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unconditional_until TIMESTAMPTZ NOT NULL, -- start_date + 7 dias
  monitoring_until TIMESTAMPTZ NOT NULL,    -- start_date + 30 dias (gravação)
  retention_until TIMESTAMPTZ NOT NULL,     -- start_date + 90 dias (consulta)
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_review', 'refunded', 'denied', 'expired')),
  decision_reason TEXT,
  decided_at TIMESTAMPTZ,
  decided_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_purchase UNIQUE(user_id, purchase_id)
);

CREATE INDEX idx_guarantee_enrollments_user ON public.guarantee_enrollments(user_id);
CREATE INDEX idx_guarantee_enrollments_status ON public.guarantee_enrollments(status);
CREATE INDEX idx_guarantee_enrollments_dates ON public.guarantee_enrollments(start_date, monitoring_until);

-- Criar tabela de plays diários agregados
CREATE TABLE IF NOT EXISTS public.guarantee_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.guarantee_enrollments(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  plays_valid INTEGER NOT NULL DEFAULT 0,
  meets_20 BOOLEAN GENERATED ALWAYS AS (plays_valid >= 20) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_enrollment_day UNIQUE(enrollment_id, day)
);

CREATE INDEX idx_guarantee_daily_enrollment ON public.guarantee_daily(enrollment_id, day);

-- View para calcular status atual de cada garantia
CREATE OR REPLACE VIEW public.v_guarantee_status AS
WITH daily_streaks AS (
  SELECT 
    enrollment_id,
    day,
    meets_20,
    SUM(CASE WHEN NOT meets_20 THEN 1 ELSE 0 END) 
      OVER (PARTITION BY enrollment_id ORDER BY day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS streak_reset
  FROM public.guarantee_daily
),
consecutive_runs AS (
  SELECT 
    enrollment_id,
    streak_reset,
    COUNT(*) FILTER (WHERE meets_20) AS consecutive_days
  FROM daily_streaks
  GROUP BY enrollment_id, streak_reset
),
best_streaks AS (
  SELECT 
    enrollment_id,
    MAX(consecutive_days) AS best_len
  FROM consecutive_runs
  GROUP BY enrollment_id
)
SELECT 
  ge.id,
  ge.user_id,
  ge.purchase_id,
  ge.start_date,
  ge.unconditional_until,
  ge.monitoring_until,
  ge.retention_until,
  ge.status,
  ge.decision_reason,
  ge.decided_at,
  ge.decided_by,
  COALESCE(bs.best_len, 0) AS best_len,
  CASE 
    WHEN ge.status IN ('refunded', 'denied', 'expired') THEN ge.status
    WHEN NOW() <= ge.unconditional_until THEN 'unconditional_window'
    WHEN COALESCE(bs.best_len, 0) >= 21 THEN 'conditional_met'
    WHEN NOW() > ge.monitoring_until THEN 'expired'
    ELSE 'conditional_running'
  END AS computed_state,
  ge.created_at,
  ge.updated_at
FROM public.guarantee_enrollments ge
LEFT JOIN best_streaks bs ON bs.enrollment_id = ge.id;

-- Trigger para criar enrollment automaticamente quando assinatura é ativada
CREATE OR REPLACE FUNCTION public.create_guarantee_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar enrollment apenas se for transição para active
  IF NEW.subscription_status IN ('active', 'trialing') 
     AND (OLD.subscription_status IS NULL OR OLD.subscription_status NOT IN ('active', 'trialing'))
     AND NEW.stripe_subscription_id IS NOT NULL THEN
    
    INSERT INTO public.guarantee_enrollments (
      user_id,
      purchase_id,
      start_date,
      unconditional_until,
      monitoring_until,
      retention_until
    ) VALUES (
      NEW.user_id,
      NEW.stripe_subscription_id,
      NOW(),
      NOW() + INTERVAL '7 days',
      NOW() + INTERVAL '30 days',  -- 30 dias de gravação
      NOW() + INTERVAL '90 days'   -- 90 dias de retenção para consulta
    )
    ON CONFLICT (user_id, purchase_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_create_guarantee_enrollment
AFTER INSERT OR UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.create_guarantee_enrollment();

-- Função para agregar plays diários (será chamada por cron ou manualmente)
CREATE OR REPLACE FUNCTION public.aggregate_guarantee_daily(target_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS void AS $$
BEGIN
  INSERT INTO public.guarantee_daily (enrollment_id, day, plays_valid)
  SELECT 
    ge.id AS enrollment_id,
    target_date AS day,
    COUNT(DISTINCT ah.id) AS plays_valid
  FROM public.guarantee_enrollments ge
  INNER JOIN public.audio_history ah ON ah.user_id = ge.user_id
  WHERE 
    ge.status = 'active'
    AND DATE(ah.played_at) = target_date
    AND DATE(ah.played_at) >= DATE(ge.start_date)
    AND DATE(ah.played_at) <= DATE(ge.monitoring_until)
    AND ah.completed = true
  GROUP BY ge.id
  ON CONFLICT (enrollment_id, day) 
  DO UPDATE SET 
    plays_valid = EXCLUDED.plays_valid,
    created_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS Policies
ALTER TABLE public.guarantee_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guarantee_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all guarantee enrollments"
ON public.guarantee_enrollments FOR SELECT
TO authenticated
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage guarantee enrollments"
ON public.guarantee_enrollments FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all guarantee daily"
ON public.guarantee_daily FOR SELECT
TO authenticated
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view their own guarantee status"
ON public.guarantee_enrollments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_guarantee_enrollments_updated_at
BEFORE UPDATE ON public.guarantee_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();