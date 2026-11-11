"""The 12 streams of the Supply Chain Streams Lab."""
STREAMS = [
 dict(code='SC01', slug='supply-chain-strategy-boot-camp', name='Supply Chain Strategy Boot Camp', sys='Strategy and Network Design', tag='A network designed for service, cost and resilience.', hue=205),
 dict(code='SC02', slug='demand-planning-boot-camp', name='Demand Planning Boot Camp', sys='Demand Planning', tag='Forecasts everyone can trust and improve.', hue=150),
 dict(code='SC03', slug='inventory-management-boot-camp', name='Inventory Management Boot Camp', sys='Inventory and Replenishment', tag='The right stock in the right place.', hue=28),
 dict(code='SC04', slug='production-planning-boot-camp', name='Production Planning Boot Camp', sys='Production Planning', tag='Plans the plant can actually deliver.', hue=262),
 dict(code='SC05', slug='warehouse-operations-boot-camp', name='Warehouse Operations Boot Camp', sys='Warehouse Management', tag='Receive, store, pick and ship with accuracy.', hue=340),
 dict(code='SC06', slug='transportation-logistics-boot-camp', name='Transportation and Logistics Boot Camp', sys='Transportation Management', tag='Loads, routes and carriers that deliver.', hue=185),
 dict(code='SC07', slug='order-fulfilment-boot-camp', name='Order Fulfilment Boot Camp', sys='Order Fulfilment', tag='On time, in full, every time.', hue=48),
 dict(code='SC08', slug='supply-chain-visibility-boot-camp', name='Supply Chain Visibility Boot Camp', sys='Control Tower', tag='See events early and act on them.', hue=300),
 dict(code='SC09', slug='sustainable-circular-supply-boot-camp', name='Sustainable and Circular Supply Boot Camp', sys='Returns and Sustainability', tag='Returns, reuse and lower emissions.', hue=128),
 dict(code='SC10', slug='supply-chain-intelligence-boot-camp', name='Supply Chain Intelligence Boot Camp', sys='Analytics', tag='Trusted measures across the whole chain.', hue=232),
 dict(code='SC11', slug='ai-powered-supply-chain-boot-camp', name='AI-Powered Supply Chain Boot Camp', sys='Supply Chain AI', tag='Smart suggestions with human review.', hue=168),
 dict(code='SC12', slug='connected-supply-ecosystem-boot-camp', name='Connected Supply Ecosystem Boot Camp', sys='Partner Integration', tag='Partners, systems and events working as one.', hue=8),
]
def by_code(c): return next(s for s in STREAMS if s['code']==c)
def file_of(s): return '%s-%s.html' % (s['code'], s['slug'])
