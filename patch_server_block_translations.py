with open('server.js', 'r', encoding='utf-8') as f:
    s = f.read()

patches = []

# --- API endpoint patterns (JOIN variant) ---
old_intake_api = "COALESCE(tt_intake.value, t.intake, (SELECT value FROM shared_content_blocks WHERE id = t.intake_text_block_id)) AS intake"
new_intake_api = "COALESCE(tt_intake.value, (SELECT value FROM translations WHERE shared_block_id = t.intake_text_block_id AND locale = $2 LIMIT 1), t.intake, (SELECT value FROM shared_content_blocks WHERE id = t.intake_text_block_id)) AS intake"

old_ins_api = "COALESCE(tt_insurance.value, t.insurance, (SELECT value FROM shared_content_blocks WHERE id = t.insurance_coverage_block_id)) AS insurance"
new_ins_api = "COALESCE(tt_insurance.value, (SELECT value FROM translations WHERE shared_block_id = t.insurance_coverage_block_id AND locale = $2 LIMIT 1), t.insurance, (SELECT value FROM shared_content_blocks WHERE id = t.insurance_coverage_block_id)) AS insurance"

old_tsa_api = "(SELECT value FROM shared_content_blocks WHERE id = t.treatment_selection_approach_id) AS treatment_selection_approach"
new_tsa_api = "COALESCE((SELECT value FROM translations WHERE shared_block_id = t.treatment_selection_approach_id AND locale = $2 LIMIT 1), (SELECT value FROM shared_content_blocks WHERE id = t.treatment_selection_approach_id)) AS treatment_selection_approach"

for old, new, label in [
    (old_intake_api, new_intake_api, 'api intake'),
    (old_ins_api, new_ins_api, 'api insurance'),
    (old_tsa_api, new_tsa_api, 'api TSA'),
]:
    if old in s:
        s = s.replace(old, new)
        patches.append(label)
    else:
        print('WARN: not found —', label)

# --- SSR endpoint patterns (subquery variant) ---
old_intake_ssr = "COALESCE(t.intake, (SELECT value FROM shared_content_blocks WHERE id = t.intake_text_block_id)) AS intake"
new_intake_ssr = "COALESCE((SELECT value FROM translations WHERE shared_block_id = t.intake_text_block_id AND locale = $2 LIMIT 1), t.intake, (SELECT value FROM shared_content_blocks WHERE id = t.intake_text_block_id)) AS intake"

old_ins_ssr = "COALESCE(t.insurance, (SELECT value FROM shared_content_blocks WHERE id = t.insurance_coverage_block_id)) AS insurance"
new_ins_ssr = "COALESCE((SELECT value FROM translations WHERE shared_block_id = t.insurance_coverage_block_id AND locale = $2 LIMIT 1), t.insurance, (SELECT value FROM shared_content_blocks WHERE id = t.insurance_coverage_block_id)) AS insurance"

old_tsa_ssr = "(SELECT value FROM shared_content_blocks WHERE id = t.treatment_selection_approach_id) AS treatment_selection_approach"
# Note: if this pattern already matched in the API patch, it's now the new string, so this will match the SSR one separately.
new_tsa_ssr = "COALESCE((SELECT value FROM translations WHERE shared_block_id = t.treatment_selection_approach_id AND locale = $2 LIMIT 1), (SELECT value FROM shared_content_blocks WHERE id = t.treatment_selection_approach_id)) AS treatment_selection_approach"

for old, new, label in [
    (old_intake_ssr, new_intake_ssr, 'ssr intake'),
    (old_ins_ssr, new_ins_ssr, 'ssr insurance'),
    (old_tsa_ssr, new_tsa_ssr, 'ssr TSA'),
]:
    if old in s:
        s = s.replace(old, new)
        patches.append(label)
    else:
        print('WARN: not found —', label)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(s)

print('Patches applied:', patches if patches else 'NONE')
