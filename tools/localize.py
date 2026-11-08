"""Per-country localization of the shared India-authored content (sections 55-108, quiz scenarios, arcade pack).

The shared content was written around one fictional India case. This module swaps every case-specific word for the
country's own case data (name, code, currency, learner, city) and replaces the few India statutory phrases with
neutral wording, so no country workbook carries another country's facts.

Edition 'replication' (appendix) workbooks define no currency; they use XTS, the ISO 4217 code reserved for testing.
"""
import re
import pycountry

SPECIAL_A3 = {'XK': 'XKX'}
AN_EXCEPT = {'Uganda'}


def alpha3(code):
    if code in SPECIAL_A3:
        return SPECIAL_A3[code]
    return pycountry.countries.get(alpha_2=code).alpha_3


class Ctx:
    def __init__(self, c):
        self.country = c['country']
        self.code = c['code']
        self.a3 = alpha3(self.code)
        self.cur = c['currency'] or 'XTS'
        self.person = c['person']
        self.city = c['city']
        self.app = c['edition'] == 'replication'
        self.ident = (c.get('identityContext') or '').strip().rstrip('.')
        alts = [x for x in ('USD', 'EUR', 'GBP', 'JPY') if x != self.cur]
        self.alt, self.alt2 = alts[0], alts[1]
        self.slug = re.sub(r'[^a-z0-9]+', '-', self.country.lower()).strip('-')
        vowel = self.country[0] in 'AEIO' or (self.country[0] == 'U' and self.country in AN_EXCEPT)
        self.an = 'an' if vowel else 'a'
        self.art = 'an' if self.cur[0] in 'AEFHILMNORSX' else 'a'  # article by the spoken letter name


def phrases(x):
    ident_a = ('The %s case uses a synthetic employee identity; identifier requirements are confirmed from your own evidence' % x.country
               if x.app else 'The %s profile lists %s' % (x.country, x.ident))
    ident_b = ('The %s case uses a synthetic employee identity; map each identifier to its target and mask it in evidence.' % x.country
               if x.app else 'The %s profile lists %s; map each to its target and mask in evidence.' % (x.country, x.ident))
    return [
        ('The India profile lists PAN, employer TAN, UAN or provident-fund membership and insurance number where applicable', ident_a),
        ('The India profile lists PAN, employer TAN, provident-fund membership and insurance number; map each to its target and mask in evidence.', ident_b),
        ('The India profile lists salary-tax statements, provident-fund and insurance filings as statutory outputs; each has its own due date to verify.',
         'The %s case lists income-tax, social-insurance and other statutory outputs; each has its own due date to verify.' % x.country),
        ('provident-fund contribution total', 'social-insurance contribution total'),
        ('provident-fund membership marker', 'social-insurance membership marker'),
        ('provident fund, tax withholding', 'social insurance, tax withholding'),
        ('state work location', 'regional work location'),
        ('PAN (synthetic)', 'National identifier (synthetic)'),
        ('National ID information such as PAN, held', 'National ID information such as a tax or social-insurance identifier, held'),
        ('Ananya Rao', x.person), ('Bengaluru', x.city),
        ('TEST-IN-', 'TEST-%s-' % x.code), ('DEMO-IN-', 'DEMO-%s-' % x.code), ('POS-IN-', 'POS-%s-' % x.code),
        ('payroll area IN', 'payroll area %s' % x.code),
        ('an INR', '%s %s' % (x.art, x.cur)),
        ('INR', x.cur),
        ('an India', '%s %s' % (x.an, x.country)),
        ('India', x.country),
    ]


def s(text, x):
    if not isinstance(text, str):
        return text
    for a, b in x._ph:
        text = text.replace(a, b)
    return (text.replace('§ALT§', x.alt).replace('§ALT2§', x.alt2).replace('§A3§', x.a3).replace('§CODE§', x.code)
            .replace('§SLUG§', x.slug))


def obj(o, x):
    if isinstance(o, str):
        return s(o, x)
    if isinstance(o, list):
        return [obj(v, x) for v in o]
    if isinstance(o, tuple):
        return tuple(obj(v, x) for v in o)
    if isinstance(o, dict):
        return {k: obj(v, x) for k, v in o.items()}
    return o


def make(c):
    x = Ctx(c)
    x._ph = [] if x.country == 'India' else phrases(x)  # the India edition keeps its own statutory wording
    return x


def leftovers(o):
    """Any word that still betrays the India case after localization."""
    import json
    blob = json.dumps(o, ensure_ascii=False)
    return [w for w in ('India', 'INR', 'Ananya', 'Bengaluru', 'provident-fund', 'provident fund,', 'TEST-IN-', '§') if w in blob]
