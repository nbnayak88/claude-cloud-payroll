"""The 12 HR streams of the HR Streams Lab (Workforce theme). HR02a and HR02b are merged."""
STREAMS = [
 dict(code='HR01', slug='workforce-foundation', name='Workforce Foundation', sys='Employee Central', tag='The single source of truth for people, jobs, positions and organisation structure.', hue=212),
 dict(code='HR02', slug='talent-acquisition-onboarding', name='Talent Acquisition & Onboarding', sys='Recruiting and Onboarding', tag='From requisition to a productive first day.', hue=168),
 dict(code='HR03', slug='performance-goals', name='Performance & Goals', sys='Performance and Goals', tag='Goals, check-ins, reviews and calibration that people trust.', hue=28),
 dict(code='HR04', slug='succession-leadership', name='Succession & Leadership', sys='Succession and Development', tag='Talent pools, critical roles and ready-now successors.', hue=268),
 dict(code='HR05', slug='compensation-rewards', name='Compensation & Rewards', sys='Compensation and Variable Pay', tag='Pay structures, merit cycles and fair rewards.', hue=348),
 dict(code='HR06', slug='learning-mobility', name='Learning & Mobility', sys='Learning and Internal Mobility', tag='Skills, courses, careers and internal moves.', hue=148),
 dict(code='HR07', slug='payroll', name='Payroll', sys='Employee Central Payroll', tag='Accurate, on-time pay from master data to the bank.', hue=198),
 dict(code='HR08', slug='time-operations', name='Time & Operations', sys='Time Management and Workforce Scheduling', tag='Attendance, leave, schedules and shifts.', hue=38),
 dict(code='HR09', slug='workforce-intelligence', name='Workforce Intelligence', sys='People Analytics', tag='Metrics, dashboards and decisions backed by people data.', hue=238),
 dict(code='HR10', slug='digital-employee-experience', name='Digital Employee Experience', sys='Work Zone', tag='One simple front door to everything an employee needs.', hue=318),
 dict(code='HR11', slug='ai-powered-hr', name='AI-Powered HR', sys='Intelligent Automation', tag='Assistants, automation and guardrails for responsible AI in HR.', hue=188),
 dict(code='HR12', slug='connected-hr', name='Connected HR', sys='Integration and Extension', tag='Interfaces, events and extensions that keep HR connected.', hue=8),
]
def by_code(c): return next(s for s in STREAMS if s['code']==c)
def file_of(s): return '%s-%s.html' % (s['code'], s['slug'])
