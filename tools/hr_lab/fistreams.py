"""The 12 streams of the Finance Streams Lab."""
STREAMS = [
 dict(code='FI01', slug='autonomous-financial-close', name='Autonomous Financial Close', sys='Period-End Close', tag='A close you can explain, on time, every period.', hue=215),
 dict(code='FI02', slug='autonomous-payables', name='Autonomous Payables', sys='Accounts Payable', tag='Pay the right supplier the right amount, once.', hue=165),
 dict(code='FI03', slug='intelligent-revenue-operation', name='Intelligent Revenue Operation', sys='Billing, Revenue and Receivables', tag='Billing, recognition and cash that tell one story.', hue=30),
 dict(code='FI04', slug='digital-tax-enterprises', name='Digital Tax Enterprises', sys='Tax Compliance', tag='Tax rules applied, evidenced and reported.', hue=272),
 dict(code='FI05', slug='autonomous-treasury-operations', name='Autonomous Treasury Operations', sys='Treasury and Cash', tag='Cash, banks and risk without surprises.', hue=350),
 dict(code='FI06', slug='enterprise-financial-planning', name='Enterprise Financial Planning', sys='Planning and Forecasting', tag='Budgets, forecasts and scenarios with owners.', hue=145),
 dict(code='FI07', slug='cost-and-profitability-excellence', name='Cost and Profitability Excellence', sys='Costing and Profitability', tag='Know where margin is made and lost.', hue=200),
 dict(code='FI08', slug='enterprise-asset-accounting', name='Enterprise Asset Accounting', sys='Fixed Assets', tag='Assets recorded, depreciated and retired correctly.', hue=40),
 dict(code='FI09', slug='financial-governance-and-risk', name='Financial Governance and Risk', sys='Controls, Audit and Risk', tag='Controls that run and evidence that proves it.', hue=240),
 dict(code='FI10', slug='financial-intelligence', name='Financial Intelligence', sys='Reporting and Analytics', tag='Trusted numbers with definitions and lineage.', hue=320),
 dict(code='FI11', slug='ai-powered-financial-enterprises', name='AI-Powered Financial Enterprises', sys='Finance AI', tag='Anomaly detection and forecasts with human review.', hue=185),
 dict(code='FI12', slug='connected-financial-enterprises', name='Connected Financial Enterprises', sys='Finance Integration', tag='Finance connected to operations, supply chain and HR.', hue=10),
]
def by_code(c): return next(s for s in STREAMS if s['code']==c)
def file_of(s): return '%s-%s.html' % (s['code'], s['slug'])
