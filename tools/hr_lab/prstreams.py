"""The 12 streams of the Procurement Streams Lab."""
STREAMS = [
 dict(code='PR01', slug='procurement-strategy-boot-camp', name='Procurement Strategy Boot Camp', sys='Strategy and Governance', tag='A procurement plan tied to business goals.', hue=222),
 dict(code='PR02', slug='supply-sourcing-boot-camp', name='Supply Sourcing Boot Camp', sys='Sourcing and RFx', tag='Find, compare and choose the right suppliers.', hue=160),
 dict(code='PR03', slug='contract-excellence-boot-camp', name='Contract Excellence Boot Camp', sys='Contract Management', tag='Contracts that are clear, tracked and honoured.', hue=32),
 dict(code='PR04', slug='supplier-relationship-excellence-boot-camp', name='Supplier Relationship Excellence Boot Camp', sys='Supplier Management', tag='Scorecards, reviews and real partnerships.', hue=275),
 dict(code='PR05', slug='procure-to-pay-boot-camp', name='Procure to Pay Boot Camp', sys='Procure to Pay', tag='From requisition to payment without surprises.', hue=352),
 dict(code='PR06', slug='resilient-supply-operations-boot-camp', name='Resilient Supply Operations Boot Camp', sys='Supply Continuity', tag='Keep supply flowing when things go wrong.', hue=140),
 dict(code='PR07', slug='supplier-quality-boot-camp', name='Supplier Quality Boot Camp', sys='Supplier Quality', tag='Audits, defects and corrective action.', hue=196),
 dict(code='PR08', slug='spend-optimization-boot-camp', name='Spend Optimization Boot Camp', sys='Spend and Savings', tag='Find savings and make them stick.', hue=42),
 dict(code='PR09', slug='risk-and-sustainable-procurement-boot-camp', name='Risk and Sustainable Procurement Boot Camp', sys='Risk and Sustainability', tag='Responsible sourcing and managed risk.', hue=245),
 dict(code='PR10', slug='procurement-intelligence-boot-camp', name='Procurement Intelligence Boot Camp', sys='Spend Analytics', tag='Clear spend visibility and trusted dashboards.', hue=322),
 dict(code='PR11', slug='ai-powered-procurement-boot-camp', name='AI-Powered Procurement Boot Camp', sys='Procurement AI', tag='Copilots and recommendations with human review.', hue=182),
 dict(code='PR12', slug='connected-procurement-boot-camp', name='Connected Procurement Boot Camp', sys='Procurement Integration', tag='Procurement connected to supply chain, operations and finance.', hue=12),
]
def by_code(c): return next(s for s in STREAMS if s['code']==c)
def file_of(s): return '%s-%s.html' % (s['code'], s['slug'])
