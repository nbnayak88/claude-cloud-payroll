"""The 12 streams of the CX (CRM) Streams Lab."""
STREAMS = [
 dict(code='CX01', slug='connected-customer-enterprises', name='Connected Customer Enterprises', sys='Customer Data and Integration', tag='A trusted 360-degree view of every customer.', hue=212),
 dict(code='CX02', slug='autonomous-customer-engagement', name='Autonomous Customer Engagement', sys='Engagement and Personalisation', tag='Personal, timely conversations at scale.', hue=168),
 dict(code='CX03', slug='intelligent-revenue-organization', name='Intelligent Revenue Organization', sys='Revenue Operations', tag='Pricing, pipeline and forecasts that agree with each other.', hue=28),
 dict(code='CX04', slug='digital-commerce-enterprises', name='Digital Commerce Enterprises', sys='Digital Commerce', tag='Storefronts, carts and orders that just work.', hue=268),
 dict(code='CX05', slug='autonomous-customer-service', name='Autonomous Customer Service', sys='Customer Service', tag='Self-service, assistants and fast human help.', hue=348),
 dict(code='CX06', slug='exceptional-customer-experience', name='Exceptional Customer Experience', sys='CX Strategy and Journeys', tag='Journeys, feedback and scores that drive action.', hue=148),
 dict(code='CX07', slug='recurring-revenue-enterprises', name='Recurring Revenue Enterprises', sys='Subscription Management', tag='Subscriptions, renewals and expansion.', hue=198),
 dict(code='CX08', slug='autonomous-customer-operations', name='Autonomous Customer Operations', sys='Order and Fulfilment Operations', tag='Workflows and fulfilment without hand-offs.', hue=38),
 dict(code='CX09', slug='customer-intelligence', name='Customer Intelligence', sys='Customer Analytics', tag='Segments, predictions and insight you can act on.', hue=238),
 dict(code='CX10', slug='digital-customer-experiences', name='Digital Customer Experiences', sys='Digital Touchpoints', tag='Web, mobile and immersive experiences.', hue=318),
 dict(code='CX11', slug='ai-powered-customer-enterprises', name='AI-Powered Customer Enterprises', sys='Customer AI', tag='Copilots, recommendations and predictive service.', hue=188),
 dict(code='CX12', slug='connected-customer-ecosystems', name='Connected Customer Ecosystems', sys='Partner and Channel Ecosystem', tag='Partners, channels and orchestration.', hue=8),
]
def by_code(c): return next(s for s in STREAMS if s['code']==c)
def file_of(s): return '%s-%s.html' % (s['code'], s['slug'])
