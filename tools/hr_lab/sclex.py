from hrspec import Q
def mk(ent, entp, unit, unit1, dst, dstPhrase, verb, fc1, recon, stages, terms, phrases, groups, cats,
       quiz, flows, nodes, zones, zitems, parts, fixes, issues, risks, fields4, integ2, topics, logic, noun):
    n = noun
    generic = [
     Q('Who should own each %s process?' % n, 'A named owner', ['Nobody', 'Whoever is free', 'The supplier'], 'Ownership keeps it running.'),
     Q('Why record the reason for an exception?', 'So the cause can be fixed', ['To add paper', 'To blame someone', 'To hide it'], 'Learn from exceptions.'),
     Q('Two reports disagree. What helps first?', 'Agree one definition and one source', ['Ignore it', 'Add a third report', 'Hide one'], 'A single version of the truth.'),
     Q('Why test a change before release?', 'To find problems early', ['To add steps', 'To delay', 'To raise cost'], 'Test first.'),
     Q('What proves an improvement worked?', 'A measured result against a baseline', ['A longer meeting', 'A new logo', 'More forms'], 'Measure it.'),
     Q('Why keep an audit trail?', 'Decisions can be traced and explained', ['It fills storage', 'It slows work', 'It hides errors'], 'Traceability.'),
     Q('A rule is often overridden. What does it suggest?', 'The rule or the process needs review', ['Ignore it', 'Add more overrides', 'Remove the log'], 'Frequent exceptions are a signal.'),
     Q('Why share %s data with partners?' % n, 'Everyone plans from the same facts', ['To add work', 'To hide data', 'To raise cost'], 'Shared facts.')]
    def issue(t):
        sym, short, cause, fix, prevent = t
        return dict(sym=sym, short=short, cause=cause, fix=fix, why=cause + '.', clues=['Symptom: ' + short, 'Cause: ' + cause.lower(), 'Control: missing'],
                    chain=['Problem: ' + short, 'Because: ' + cause.lower(), 'Control was missing', 'No owner watching'], prevent=prevent,
                    log='Symptom: ' + short, log2='Cause: ' + cause.lower(), log3='Control: missing')
    common = [('Record ID', 'TEST-{code}-001', '(blank)', 'Every record needs an ID'), ('Owner', 'TEST-{code}-010', '(blank)', 'An owner is required'),
              ('Status', 'Active', 'Unknown', 'A valid status is required'), ('Date', '2026-10-05', '2027-10-05', 'Date cannot be in the future')]
    return dict(ent=ent, entp=entp, unit=unit, unit1=unit1, dst=dst, dstPhrase=dstPhrase, verb=verb, fc1=fc1, recon_noun=recon, stages=stages,
        terms=terms, phrases=phrases, groups=groups, cats=cats, quiz=(quiz + generic)[:18], flows=flows,
        steps=['Freeze the inputs', 'Run a draft', 'Review the exceptions', 'Fix the data gaps', 'Re-run the draft', 'Approve the plan', 'Release it', 'Monitor the first cycle', 'Confirm the results', 'Prepare the next cycle'],
        nodes=nodes, zones=zones, zitems=zitems, parts=parts, decoys=['Printer', 'Parking permit'], fixes=fixes,
        issues=[issue(t) for t in issues], risks=risks, fields=fields4 + common,
        integ=integ2 + [('Currency', 'USD', ['USD', 'US$', '840']), ('Status', 'ACT', ['Active', 'A', '00'])], topics=topics, logic=logic)
