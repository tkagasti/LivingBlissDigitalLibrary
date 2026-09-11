-- Representative content for the current Living Bliss prototype.
-- Apply only after database/platform-migrations/0000_create_learning_platform.sql.
-- All scripture, translations and commentary below remain DRAFT until approved
-- by the relevant edition owner and scholarly/editorial authority.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET time_zone = '+00:00';

INSERT INTO `languages` (`code`, `english_name`, `native_name`, `direction`, `status`) VALUES
  ('en', 'English', 'English', 'ltr', 'active'),
  ('hi', 'Hindi', 'हिन्दी', 'ltr', 'active'),
  ('or', 'Odia', 'ଓଡ଼ିଆ', 'ltr', 'active'),
  ('sa', 'Sanskrit', 'संस्कृतम्', 'ltr', 'active')
ON DUPLICATE KEY UPDATE `english_name` = VALUES(`english_name`), `native_name` = VALUES(`native_name`), `status` = VALUES(`status`);

INSERT INTO `writing_scripts` (`code`, `english_name`, `native_name`, `direction`) VALUES
  ('Latn', 'Latin', 'Latin', 'ltr'),
  ('Deva', 'Devanagari', 'देवनागरी', 'ltr'),
  ('Orya', 'Odia', 'ଓଡ଼ିଆ', 'ltr')
ON DUPLICATE KEY UPDATE `english_name` = VALUES(`english_name`), `native_name` = VALUES(`native_name`);

INSERT INTO `organisations`
  (`id`, `slug`, `legal_name`, `display_name`, `organisation_type`, `country_code`, `default_language_code`, `time_zone`, `status`, `settings`)
VALUES
  ('org-living-bliss', 'living-bliss', 'Living Bliss', 'Living Bliss', 'spiritual-education', 'AU', 'en', 'Australia/Sydney', 'active',
   JSON_OBJECT('contentGovernance', 'edition-controlled', 'minorSafety', true, 'aiDefaultMode', 'retrieval-only'))
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`), `default_language_code` = VALUES(`default_language_code`), `settings` = VALUES(`settings`);

INSERT INTO `organisation_domains` (`id`, `organisation_id`, `hostname`, `is_primary`, `verified_at`) VALUES
  ('domain-library-lb', 'org-living-bliss', 'library.livingbliss.org', true, NULL)
ON DUPLICATE KEY UPDATE `organisation_id` = VALUES(`organisation_id`), `is_primary` = VALUES(`is_primary`);

INSERT INTO `organisation_branding`
  (`organisation_id`, `logo_url`, `primary_color`, `secondary_color`, `accent_color`, `font_family`, `theme`)
VALUES
  ('org-living-bliss', '/living-bliss-logo-2026.png', '#17264d', '#f7f1e7', '#b66a26', 'Inter, system-ui, sans-serif',
   JSON_OBJECT('surface', '#fffdf9', 'readingSurface', '#fbf7ef', 'commentaryAccent', '#68456b'))
ON DUPLICATE KEY UPDATE `logo_url` = VALUES(`logo_url`), `theme` = VALUES(`theme`);

INSERT INTO `content_licenses`
  (`id`, `organisation_id`, `code`, `name`, `rights_holder`, `permitted_uses`)
VALUES
  ('license-prototype-review', 'org-living-bliss', 'LB-PROTOTYPE-REVIEW', 'Living Bliss prototype review only', 'Living Bliss',
   JSON_OBJECT('publicDisplay', false, 'training', false, 'aiRetrieval', true, 'aiTraining', false))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `permitted_uses` = VALUES(`permitted_uses`);

INSERT INTO `source_documents`
  (`id`, `organisation_id`, `license_id`, `title`, `author`, `publisher`, `source_url`, `rights_status`, `citation`)
VALUES
  ('source-gita-prototype', 'org-living-bliss', 'license-prototype-review', 'Bhagavad Gita prototype editorial source set',
   'Living Bliss editorial programme', 'Living Bliss', 'https://www.gitasupersite.iitk.ac.in/', 'review-required',
   'Prototype compilation. Every production text requires source, rights and scholarly approval.')
ON DUPLICATE KEY UPDATE `source_url` = VALUES(`source_url`), `rights_status` = VALUES(`rights_status`), `citation` = VALUES(`citation`);

INSERT INTO `persons` (`id`, `slug`, `canonical_name`, `person_type`) VALUES
  ('person-shankara', 'adi-shankaracharya', 'Ādi Śaṅkarācārya', 'commentator'),
  ('person-ramanuja', 'sri-ramanujacharya', 'Śrī Rāmānujācārya', 'commentator'),
  ('person-madhva', 'sri-madhvacharya', 'Śrī Madhvācārya', 'commentator'),
  ('person-sridhara', 'sridhara-svami', 'Śrīdhara Svāmī', 'commentator')
ON DUPLICATE KEY UPDATE `canonical_name` = VALUES(`canonical_name`), `person_type` = VALUES(`person_type`);

INSERT INTO `person_names` (`person_id`, `language_code`, `display_name`) VALUES
  ('person-shankara', 'en', 'Ādi Śaṅkarācārya'), ('person-shankara', 'hi', 'आदि शंकराचार्य'), ('person-shankara', 'or', 'ଆଦି ଶଙ୍କରାଚାର୍ଯ୍ୟ'),
  ('person-ramanuja', 'en', 'Śrī Rāmānujācārya'), ('person-ramanuja', 'hi', 'श्री रामानुजाचार्य'), ('person-ramanuja', 'or', 'ଶ୍ରୀ ରାମାନୁଜାଚାର୍ଯ୍ୟ'),
  ('person-madhva', 'en', 'Śrī Madhvācārya'), ('person-madhva', 'hi', 'श्री मध्वाचार्य'), ('person-madhva', 'or', 'ଶ୍ରୀ ମଧ୍ୱାଚାର୍ଯ୍ୟ'),
  ('person-sridhara', 'en', 'Śrīdhara Svāmī'), ('person-sridhara', 'hi', 'श्रीधर स्वामी'), ('person-sridhara', 'or', 'ଶ୍ରୀଧର ସ୍ୱାମୀ')
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`);

INSERT INTO `commentary_traditions` (`id`, `slug`, `canonical_name`, `description`) VALUES
  ('tradition-advaita', 'advaita-vedanta', 'Advaita Vedānta', 'Classical Advaita Vedānta commentarial tradition.'),
  ('tradition-vishishtadvaita', 'vishishtadvaita-vedanta', 'Viśiṣṭādvaita Vedānta', 'Classical Viśiṣṭādvaita Vedānta commentarial tradition.'),
  ('tradition-dvaita', 'dvaita-vedanta', 'Dvaita Vedānta', 'Classical Dvaita Vedānta commentarial tradition.'),
  ('tradition-vaishnava', 'classical-vaishnava', 'Classical Vaiṣṇava tradition', 'Classical Vaiṣṇava commentarial tradition.')
ON DUPLICATE KEY UPDATE `canonical_name` = VALUES(`canonical_name`), `description` = VALUES(`description`);

INSERT INTO `scripture_works`
  (`id`, `slug`, `canonical_title`, `work_type`, `canonical_language_code`, `chapter_count`, `verse_count`, `status`)
VALUES
  ('work-bhagavad-gita', 'bhagavad-gita', 'Śrīmad Bhagavad Gītā', 'scripture', 'sa', 18, 700, 'active')
ON DUPLICATE KEY UPDATE `canonical_title` = VALUES(`canonical_title`), `chapter_count` = VALUES(`chapter_count`), `verse_count` = VALUES(`verse_count`);

INSERT INTO `scripture_work_names` (`work_id`, `language_code`, `title`, `short_description`) VALUES
  ('work-bhagavad-gita', 'en', 'Bhagavad Gita', 'A dialogue between Śrī Krishna and Arjuna within the Mahābhārata.'),
  ('work-bhagavad-gita', 'hi', 'भगवद्गीता', 'महाभारत में श्रीकृष्ण और अर्जुन के बीच संवाद।'),
  ('work-bhagavad-gita', 'or', 'ଭଗବଦ୍ ଗୀତା', 'ମହାଭାରତରେ ଶ୍ରୀକୃଷ୍ଣ ଓ ଅର୍ଜୁନଙ୍କ ମଧ୍ୟରେ ସଂଳାପ।')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `short_description` = VALUES(`short_description`);

INSERT INTO `scripture_chapters`
  (`id`, `work_id`, `chapter_number`, `canonical_title`, `verse_count`, `sort_order`)
VALUES
  ('chapter-gita-02', 'work-bhagavad-gita', 2, 'Sāṅkhya Yoga', 72, 2)
ON DUPLICATE KEY UPDATE `canonical_title` = VALUES(`canonical_title`), `verse_count` = VALUES(`verse_count`), `sort_order` = VALUES(`sort_order`);

INSERT INTO `scripture_chapter_localizations`
  (`chapter_id`, `language_code`, `title`, `focus`, `essential_question`)
VALUES
  ('chapter-gita-02', 'en', 'Sāṅkhya Yoga', 'Self, steadiness, right action and foundational teachings.', 'What changes when action is guided by clear understanding rather than fear of results?'),
  ('chapter-gita-02', 'hi', 'सांख्य योग', 'आत्मा, स्थिरता, उचित कर्म और आधारभूत शिक्षाएँ।', 'जब कर्म फल के भय के बजाय स्पष्ट समझ से निर्देशित हो तो क्या बदलता है?'),
  ('chapter-gita-02', 'or', 'ସାଂଖ୍ୟ ଯୋଗ', 'ଆତ୍ମା, ସ୍ଥିରତା, ସଠିକ୍ କର୍ମ ଓ ମୌଳିକ ଶିକ୍ଷା।', 'ଫଳର ଭୟ ବଦଳରେ ସ୍ପଷ୍ଟ ବୁଝାମଣା କର୍ମକୁ ନେତୃତ୍ୱ ଦେଲେ କଣ ବଦଳେ?')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `focus` = VALUES(`focus`), `essential_question` = VALUES(`essential_question`);

INSERT INTO `scripture_verses`
  (`id`, `chapter_id`, `verse_number`, `canonical_reference`, `sort_order`, `status`)
VALUES
  ('verse-gita-02-047', 'chapter-gita-02', '47', '2.47', 47, 'active'),
  ('verse-gita-02-048', 'chapter-gita-02', '48', '2.48', 48, 'active')
ON DUPLICATE KEY UPDATE `chapter_id` = VALUES(`chapter_id`), `sort_order` = VALUES(`sort_order`), `status` = VALUES(`status`);

INSERT INTO `scripture_editions`
  (`id`, `work_id`, `owner_organisation_id`, `slug`, `name`, `authority_statement`, `status`)
VALUES
  ('edition-lb-gita-reference', 'work-bhagavad-gita', 'org-living-bliss', 'living-bliss-reference', 'Living Bliss reference edition',
   'Prototype editorial edition. Production publication requires edition-owner, rights and scholarly approval.', 'draft')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `authority_statement` = VALUES(`authority_statement`), `status` = VALUES(`status`);

INSERT INTO `scripture_edition_releases`
  (`id`, `edition_id`, `version_label`, `publication_status`, `source_document_id`, `license_id`, `release_notes`)
VALUES
  ('release-lb-gita-prototype-1', 'edition-lb-gita-reference', 'prototype-1', 'prototype', 'source-gita-prototype', 'license-prototype-review',
   'Representative data matching the current user-interface prototype.')
ON DUPLICATE KEY UPDATE `publication_status` = VALUES(`publication_status`), `source_document_id` = VALUES(`source_document_id`), `release_notes` = VALUES(`release_notes`);

INSERT INTO `publication_profiles`
  (`id`, `organisation_id`, `slug`, `name`, `audience_type`, `jurisdiction_code`, `default_language_code`, `status`, `settings`)
VALUES
  ('profile-lb-gita-general', 'org-living-bliss', 'gita-general', 'Living Bliss Bhagavad Gita', 'general', 'GLOBAL', 'en', 'prototype',
   JSON_OBJECT('languages', JSON_ARRAY('en', 'hi', 'or'), 'allowGuruSelection', true, 'readAloud', true))
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `settings` = VALUES(`settings`), `status` = VALUES(`status`);

INSERT INTO `publication_scripture_releases`
  (`publication_profile_id`, `work_id`, `edition_release_id`, `is_default`)
VALUES
  ('profile-lb-gita-general', 'work-bhagavad-gita', 'release-lb-gita-prototype-1', true)
ON DUPLICATE KEY UPDATE `edition_release_id` = VALUES(`edition_release_id`), `is_default` = VALUES(`is_default`);

INSERT INTO `verse_texts`
  (`id`, `edition_release_id`, `verse_id`, `language_code`, `script_code`, `representation`, `text`, `line_breaks`, `editorial_status`)
VALUES
  ('text-2-47-deva', 'release-lb-gita-prototype-1', 'verse-gita-02-047', 'sa', 'Deva', 'canonical-script', 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥', JSON_ARRAY(1), 'draft'),
  ('text-2-47-orya', 'release-lb-gita-prototype-1', 'verse-gita-02-047', 'sa', 'Orya', 'canonical-script', 'କର୍ମଣ୍ୟେବାଧିକାରସ୍ତେ ମା ଫଳେଷୁ କଦାଚନ ।\nମା କର୍ମଫଳହେତୁର୍ଭୂର୍ମା ତେ ସଙ୍ଗୋଽସ୍ତ୍ୱକର୍ମଣି ॥', JSON_ARRAY(1), 'draft'),
  ('text-2-47-latn', 'release-lb-gita-prototype-1', 'verse-gita-02-047', 'sa', 'Latn', 'transliteration', 'karmaṇy evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi', JSON_ARRAY(1), 'draft'),
  ('text-2-48-deva', 'release-lb-gita-prototype-1', 'verse-gita-02-048', 'sa', 'Deva', 'canonical-script', 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥', JSON_ARRAY(1), 'draft'),
  ('text-2-48-orya', 'release-lb-gita-prototype-1', 'verse-gita-02-048', 'sa', 'Orya', 'canonical-script', 'ଯୋଗସ୍ଥଃ କୁରୁ କର୍ମାଣି ସଙ୍ଗଂ ତ୍ୟକ୍ତ୍ୱା ଧନଞ୍ଜୟ ।\nସିଦ୍ଧ୍ୟସିଦ୍ଧ୍ୟୋଃ ସମୋ ଭୂତ୍ୱା ସମତ୍ୱଂ ଯୋଗ ଉଚ୍ୟତେ ॥', JSON_ARRAY(1), 'draft'),
  ('text-2-48-latn', 'release-lb-gita-prototype-1', 'verse-gita-02-048', 'sa', 'Latn', 'transliteration', 'yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate', JSON_ARRAY(1), 'draft')
ON DUPLICATE KEY UPDATE `text` = VALUES(`text`), `line_breaks` = VALUES(`line_breaks`), `editorial_status` = VALUES(`editorial_status`);

INSERT INTO `verse_translations`
  (`id`, `edition_release_id`, `verse_id`, `language_code`, `translation_key`, `text`, `editorial_status`)
VALUES
  ('translation-2-47-en', 'release-lb-gita-prototype-1', 'verse-gita-02-047', 'en', 'primary', 'Your responsibility is for action alone, never for command over its results. Do not make the fruit of action your motive, and do not become attached to inaction.', 'draft'),
  ('translation-2-47-hi', 'release-lb-gita-prototype-1', 'verse-gita-02-047', 'hi', 'primary', 'तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। कर्मफल को अपना हेतु मत बनाओ और अकर्म में भी तुम्हारी आसक्ति न हो।', 'draft'),
  ('translation-2-47-or', 'release-lb-gita-prototype-1', 'verse-gita-02-047', 'or', 'primary', 'ତୁମର ଅଧିକାର କେବଳ କର୍ମ କରିବାରେ, ତାହାର ଫଳରେ କେବେ ନୁହେଁ। କର୍ମଫଳକୁ ନିଜ ଉଦ୍ଦେଶ୍ୟ କର ନାହିଁ ଏବଂ ଅକର୍ମରେ ମଧ୍ୟ ଆସକ୍ତ ହୁଅ ନାହିଁ।', 'draft'),
  ('translation-2-48-en', 'release-lb-gita-prototype-1', 'verse-gita-02-048', 'en', 'primary', 'Established in yoga, perform your actions after relinquishing attachment, O Dhanañjaya. Remain even in success and failure; this equanimity is called yoga.', 'draft'),
  ('translation-2-48-hi', 'release-lb-gita-prototype-1', 'verse-gita-02-048', 'hi', 'primary', 'हे धनञ्जय, आसक्ति त्यागकर योग में स्थित होकर कर्म करो। सिद्धि और असिद्धि में समान रहो; यह समभाव ही योग कहलाता है।', 'draft'),
  ('translation-2-48-or', 'release-lb-gita-prototype-1', 'verse-gita-02-048', 'or', 'primary', 'ହେ ଧନଞ୍ଜୟ, ଆସକ୍ତି ତ୍ୟାଗ କରି ଯୋଗରେ ସ୍ଥିତ ହୋଇ କର୍ମ କର। ସଫଳତା ଓ ବିଫଳତାରେ ସମଭାବ ରଖ; ଏହି ସମତ୍ୱକୁ ଯୋଗ କୁହାଯାଏ।', 'draft')
ON DUPLICATE KEY UPDATE `text` = VALUES(`text`), `editorial_status` = VALUES(`editorial_status`);

INSERT INTO `verse_learning_notes`
  (`id`, `edition_release_id`, `verse_id`, `language_code`, `note_type`, `sequence`, `title`, `text`, `editorial_status`)
VALUES
  ('note-2-47-context-en', 'release-lb-gita-prototype-1', 'verse-gita-02-047', 'en', 'scene-context', 1, 'Scene and context', 'On the battlefield, Krishna redirects Arjuna from anxiety about results toward disciplined responsibility for right action.', 'draft'),
  ('note-2-47-context-hi', 'release-lb-gita-prototype-1', 'verse-gita-02-047', 'hi', 'scene-context', 1, 'दृश्य और प्रसंग', 'युद्धभूमि में श्रीकृष्ण अर्जुन का ध्यान फल की चिंता से हटाकर उचित कर्म के अनुशासित उत्तरदायित्व की ओर ले जाते हैं।', 'draft'),
  ('note-2-47-context-or', 'release-lb-gita-prototype-1', 'verse-gita-02-047', 'or', 'scene-context', 1, 'ଦୃଶ୍ୟ ଓ ପ୍ରସଙ୍ଗ', 'ଯୁଦ୍ଧଭୂମିରେ ଶ୍ରୀକୃଷ୍ଣ ଅର୍ଜୁନଙ୍କୁ ଫଳର ଚିନ୍ତାରୁ ସଠିକ୍ କର୍ମର ଶୃଙ୍ଖଳିତ ଦାୟିତ୍ୱ ପ୍ରତି ନେଇଯାଆନ୍ତି।', 'draft'),
  ('note-2-48-context-en', 'release-lb-gita-prototype-1', 'verse-gita-02-048', 'en', 'scene-context', 1, 'Scene and context', 'Krishna continues the teaching by describing the inner steadiness with which Arjuna is to perform his duty.', 'draft'),
  ('note-2-48-context-hi', 'release-lb-gita-prototype-1', 'verse-gita-02-048', 'hi', 'scene-context', 1, 'दृश्य और प्रसंग', 'श्रीकृष्ण उस आन्तरिक स्थिरता का वर्णन करते हुए शिक्षा आगे बढ़ाते हैं जिसके साथ अर्जुन को अपना कर्तव्य करना है।', 'draft'),
  ('note-2-48-context-or', 'release-lb-gita-prototype-1', 'verse-gita-02-048', 'or', 'scene-context', 1, 'ଦୃଶ୍ୟ ଓ ପ୍ରସଙ୍ଗ', 'ଅର୍ଜୁନ ଯେଉଁ ଆନ୍ତରିକ ସ୍ଥିରତା ସହ ନିଜ କର୍ତ୍ତବ୍ୟ କରିବେ, ଶ୍ରୀକୃଷ୍ଣ ତାହା ବର୍ଣ୍ଣନା କରି ଶିକ୍ଷାକୁ ଆଗକୁ ବଢ଼ାନ୍ତି।', 'draft')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `text` = VALUES(`text`), `editorial_status` = VALUES(`editorial_status`);

INSERT INTO `verse_sandhi_analyses`
  (`id`, `edition_release_id`, `verse_id`, `analysis_type`, `version_label`, `editorial_status`, `source_locator`)
VALUES
  ('sandhi-gita-2-47-v1', 'release-lb-gita-prototype-1', 'verse-gita-02-047', 'sandhi-vicheda', 'prototype-1', 'draft', 'Bhagavad Gita 2.47'),
  ('sandhi-gita-2-48-v1', 'release-lb-gita-prototype-1', 'verse-gita-02-048', 'sandhi-vicheda', 'prototype-1', 'draft', 'Bhagavad Gita 2.48')
ON DUPLICATE KEY UPDATE `editorial_status` = VALUES(`editorial_status`), `source_locator` = VALUES(`source_locator`);

INSERT INTO `verse_tokens` (`id`, `analysis_id`, `position`, `lemma_key`) VALUES
  ('token-2-47-01', 'sandhi-gita-2-47-v1', 1, 'karman'),
  ('token-2-47-02', 'sandhi-gita-2-47-v1', 2, 'eva'),
  ('token-2-47-03', 'sandhi-gita-2-47-v1', 3, 'adhikara'),
  ('token-2-47-04', 'sandhi-gita-2-47-v1', 4, 'tvam'),
  ('token-2-47-05', 'sandhi-gita-2-47-v1', 5, 'ma'),
  ('token-2-47-06', 'sandhi-gita-2-47-v1', 6, 'phala'),
  ('token-2-47-07', 'sandhi-gita-2-47-v1', 7, 'kadacana'),
  ('token-2-47-08', 'sandhi-gita-2-47-v1', 8, 'karma-phala-hetu'),
  ('token-2-47-09', 'sandhi-gita-2-47-v1', 9, 'bhu'),
  ('token-2-47-10', 'sandhi-gita-2-47-v1', 10, 'sanga'),
  ('token-2-47-11', 'sandhi-gita-2-47-v1', 11, 'as'),
  ('token-2-47-12', 'sandhi-gita-2-47-v1', 12, 'akarman'),
  ('token-2-48-01', 'sandhi-gita-2-48-v1', 1, 'yoga-stha'),
  ('token-2-48-02', 'sandhi-gita-2-48-v1', 2, 'kr'),
  ('token-2-48-03', 'sandhi-gita-2-48-v1', 3, 'karman'),
  ('token-2-48-04', 'sandhi-gita-2-48-v1', 4, 'sanga'),
  ('token-2-48-05', 'sandhi-gita-2-48-v1', 5, 'tyaj'),
  ('token-2-48-06', 'sandhi-gita-2-48-v1', 6, 'dhananjaya'),
  ('token-2-48-07', 'sandhi-gita-2-48-v1', 7, 'siddhi-asiddhi'),
  ('token-2-48-08', 'sandhi-gita-2-48-v1', 8, 'sama'),
  ('token-2-48-09', 'sandhi-gita-2-48-v1', 9, 'bhu'),
  ('token-2-48-10', 'sandhi-gita-2-48-v1', 10, 'samatva'),
  ('token-2-48-11', 'sandhi-gita-2-48-v1', 11, 'yoga'),
  ('token-2-48-12', 'sandhi-gita-2-48-v1', 12, 'vac')
ON DUPLICATE KEY UPDATE `analysis_id` = VALUES(`analysis_id`), `position` = VALUES(`position`), `lemma_key` = VALUES(`lemma_key`);

INSERT INTO `verse_token_forms` (`id`, `token_id`, `language_code`, `script_code`, `form_type`, `text`) VALUES
  ('form-247-01-deva', 'token-2-47-01', 'sa', 'Deva', 'split', 'कर्मणि'), ('form-247-01-orya', 'token-2-47-01', 'sa', 'Orya', 'split', 'କର୍ମଣି'), ('form-247-01-latn', 'token-2-47-01', 'sa', 'Latn', 'transliteration', 'karmaṇi'),
  ('form-247-02-deva', 'token-2-47-02', 'sa', 'Deva', 'split', 'एव'), ('form-247-02-orya', 'token-2-47-02', 'sa', 'Orya', 'split', 'ଏବ'), ('form-247-02-latn', 'token-2-47-02', 'sa', 'Latn', 'transliteration', 'eva'),
  ('form-247-03-deva', 'token-2-47-03', 'sa', 'Deva', 'split', 'अधिकारः'), ('form-247-03-orya', 'token-2-47-03', 'sa', 'Orya', 'split', 'ଅଧିକାରଃ'), ('form-247-03-latn', 'token-2-47-03', 'sa', 'Latn', 'transliteration', 'adhikāraḥ'),
  ('form-247-04-deva', 'token-2-47-04', 'sa', 'Deva', 'split', 'ते'), ('form-247-04-orya', 'token-2-47-04', 'sa', 'Orya', 'split', 'ତେ'), ('form-247-04-latn', 'token-2-47-04', 'sa', 'Latn', 'transliteration', 'te'),
  ('form-247-05-deva', 'token-2-47-05', 'sa', 'Deva', 'split', 'मा'), ('form-247-05-orya', 'token-2-47-05', 'sa', 'Orya', 'split', 'ମା'), ('form-247-05-latn', 'token-2-47-05', 'sa', 'Latn', 'transliteration', 'mā'),
  ('form-247-06-deva', 'token-2-47-06', 'sa', 'Deva', 'split', 'फलेषु'), ('form-247-06-orya', 'token-2-47-06', 'sa', 'Orya', 'split', 'ଫଳେଷୁ'), ('form-247-06-latn', 'token-2-47-06', 'sa', 'Latn', 'transliteration', 'phaleṣu'),
  ('form-247-07-deva', 'token-2-47-07', 'sa', 'Deva', 'split', 'कदाचन'), ('form-247-07-orya', 'token-2-47-07', 'sa', 'Orya', 'split', 'କଦାଚନ'), ('form-247-07-latn', 'token-2-47-07', 'sa', 'Latn', 'transliteration', 'kadācana'),
  ('form-247-08-deva', 'token-2-47-08', 'sa', 'Deva', 'split', 'कर्मफलहेतुः'), ('form-247-08-orya', 'token-2-47-08', 'sa', 'Orya', 'split', 'କର୍ମଫଳହେତୁଃ'), ('form-247-08-latn', 'token-2-47-08', 'sa', 'Latn', 'transliteration', 'karma-phala-hetuḥ'),
  ('form-247-09-deva', 'token-2-47-09', 'sa', 'Deva', 'split', 'भूः'), ('form-247-09-orya', 'token-2-47-09', 'sa', 'Orya', 'split', 'ଭୂଃ'), ('form-247-09-latn', 'token-2-47-09', 'sa', 'Latn', 'transliteration', 'bhūḥ'),
  ('form-247-10-deva', 'token-2-47-10', 'sa', 'Deva', 'split', 'सङ्गः'), ('form-247-10-orya', 'token-2-47-10', 'sa', 'Orya', 'split', 'ସଙ୍ଗଃ'), ('form-247-10-latn', 'token-2-47-10', 'sa', 'Latn', 'transliteration', 'saṅgaḥ'),
  ('form-247-11-deva', 'token-2-47-11', 'sa', 'Deva', 'split', 'अस्तु'), ('form-247-11-orya', 'token-2-47-11', 'sa', 'Orya', 'split', 'ଅସ୍ତୁ'), ('form-247-11-latn', 'token-2-47-11', 'sa', 'Latn', 'transliteration', 'astu'),
  ('form-247-12-deva', 'token-2-47-12', 'sa', 'Deva', 'split', 'अकर्मणि'), ('form-247-12-orya', 'token-2-47-12', 'sa', 'Orya', 'split', 'ଅକର୍ମଣି'), ('form-247-12-latn', 'token-2-47-12', 'sa', 'Latn', 'transliteration', 'akarmaṇi'),
  ('form-248-01-deva', 'token-2-48-01', 'sa', 'Deva', 'split', 'योगस्थः'), ('form-248-01-orya', 'token-2-48-01', 'sa', 'Orya', 'split', 'ଯୋଗସ୍ଥଃ'), ('form-248-01-latn', 'token-2-48-01', 'sa', 'Latn', 'transliteration', 'yoga-sthaḥ'),
  ('form-248-02-deva', 'token-2-48-02', 'sa', 'Deva', 'split', 'कुरु'), ('form-248-02-orya', 'token-2-48-02', 'sa', 'Orya', 'split', 'କୁରୁ'), ('form-248-02-latn', 'token-2-48-02', 'sa', 'Latn', 'transliteration', 'kuru'),
  ('form-248-03-deva', 'token-2-48-03', 'sa', 'Deva', 'split', 'कर्माणि'), ('form-248-03-orya', 'token-2-48-03', 'sa', 'Orya', 'split', 'କର୍ମାଣି'), ('form-248-03-latn', 'token-2-48-03', 'sa', 'Latn', 'transliteration', 'karmāṇi'),
  ('form-248-04-deva', 'token-2-48-04', 'sa', 'Deva', 'split', 'सङ्गम्'), ('form-248-04-orya', 'token-2-48-04', 'sa', 'Orya', 'split', 'ସଙ୍ଗମ୍'), ('form-248-04-latn', 'token-2-48-04', 'sa', 'Latn', 'transliteration', 'saṅgam'),
  ('form-248-05-deva', 'token-2-48-05', 'sa', 'Deva', 'split', 'त्यक्त्वा'), ('form-248-05-orya', 'token-2-48-05', 'sa', 'Orya', 'split', 'ତ୍ୟକ୍ତ୍ୱା'), ('form-248-05-latn', 'token-2-48-05', 'sa', 'Latn', 'transliteration', 'tyaktvā'),
  ('form-248-06-deva', 'token-2-48-06', 'sa', 'Deva', 'split', 'धनञ्जय'), ('form-248-06-orya', 'token-2-48-06', 'sa', 'Orya', 'split', 'ଧନଞ୍ଜୟ'), ('form-248-06-latn', 'token-2-48-06', 'sa', 'Latn', 'transliteration', 'dhanañjaya'),
  ('form-248-07-deva', 'token-2-48-07', 'sa', 'Deva', 'split', 'सिद्धि-असिद्ध्योः'), ('form-248-07-orya', 'token-2-48-07', 'sa', 'Orya', 'split', 'ସିଦ୍ଧି-ଅସିଦ୍ଧ୍ୟୋଃ'), ('form-248-07-latn', 'token-2-48-07', 'sa', 'Latn', 'transliteration', 'siddhi-asiddhyoḥ'),
  ('form-248-08-deva', 'token-2-48-08', 'sa', 'Deva', 'split', 'समः'), ('form-248-08-orya', 'token-2-48-08', 'sa', 'Orya', 'split', 'ସମଃ'), ('form-248-08-latn', 'token-2-48-08', 'sa', 'Latn', 'transliteration', 'samaḥ'),
  ('form-248-09-deva', 'token-2-48-09', 'sa', 'Deva', 'split', 'भूत्वा'), ('form-248-09-orya', 'token-2-48-09', 'sa', 'Orya', 'split', 'ଭୂତ୍ୱା'), ('form-248-09-latn', 'token-2-48-09', 'sa', 'Latn', 'transliteration', 'bhūtvā'),
  ('form-248-10-deva', 'token-2-48-10', 'sa', 'Deva', 'split', 'समत्वम्'), ('form-248-10-orya', 'token-2-48-10', 'sa', 'Orya', 'split', 'ସମତ୍ୱମ୍'), ('form-248-10-latn', 'token-2-48-10', 'sa', 'Latn', 'transliteration', 'samatvam'),
  ('form-248-11-deva', 'token-2-48-11', 'sa', 'Deva', 'split', 'योगः'), ('form-248-11-orya', 'token-2-48-11', 'sa', 'Orya', 'split', 'ଯୋଗଃ'), ('form-248-11-latn', 'token-2-48-11', 'sa', 'Latn', 'transliteration', 'yogaḥ'),
  ('form-248-12-deva', 'token-2-48-12', 'sa', 'Deva', 'split', 'उच्यते'), ('form-248-12-orya', 'token-2-48-12', 'sa', 'Orya', 'split', 'ଉଚ୍ୟତେ'), ('form-248-12-latn', 'token-2-48-12', 'sa', 'Latn', 'transliteration', 'ucyate')
ON DUPLICATE KEY UPDATE `text` = VALUES(`text`);

INSERT INTO `verse_token_meanings` (`id`, `token_id`, `language_code`, `sense_number`, `meaning`, `editorial_status`) VALUES
  ('meaning-247-01-en', 'token-2-47-01', 'en', 1, 'in action or duty', 'draft'), ('meaning-247-01-hi', 'token-2-47-01', 'hi', 1, 'कर्म या कर्तव्य में', 'draft'), ('meaning-247-01-or', 'token-2-47-01', 'or', 1, 'କର୍ମ ବା କର୍ତ୍ତବ୍ୟରେ', 'draft'),
  ('meaning-247-02-en', 'token-2-47-02', 'en', 1, 'only; indeed', 'draft'), ('meaning-247-02-hi', 'token-2-47-02', 'hi', 1, 'ही; केवल', 'draft'), ('meaning-247-02-or', 'token-2-47-02', 'or', 1, 'ହିଁ; କେବଳ', 'draft'),
  ('meaning-247-03-en', 'token-2-47-03', 'en', 1, 'right or authority', 'draft'), ('meaning-247-03-hi', 'token-2-47-03', 'hi', 1, 'अधिकार', 'draft'), ('meaning-247-03-or', 'token-2-47-03', 'or', 1, 'ଅଧିକାର', 'draft'),
  ('meaning-247-04-en', 'token-2-47-04', 'en', 1, 'your', 'draft'), ('meaning-247-04-hi', 'token-2-47-04', 'hi', 1, 'तुम्हारा', 'draft'), ('meaning-247-04-or', 'token-2-47-04', 'or', 1, 'ତୁମର', 'draft'),
  ('meaning-247-05-en', 'token-2-47-05', 'en', 1, 'do not; never', 'draft'), ('meaning-247-05-hi', 'token-2-47-05', 'hi', 1, 'मत; कभी नहीं', 'draft'), ('meaning-247-05-or', 'token-2-47-05', 'or', 1, 'କର ନାହିଁ; କେବେ ନୁହେଁ', 'draft'),
  ('meaning-247-06-en', 'token-2-47-06', 'en', 1, 'in the results', 'draft'), ('meaning-247-06-hi', 'token-2-47-06', 'hi', 1, 'फलों में', 'draft'), ('meaning-247-06-or', 'token-2-47-06', 'or', 1, 'ଫଳଗୁଡ଼ିକରେ', 'draft'),
  ('meaning-247-07-en', 'token-2-47-07', 'en', 1, 'at any time', 'draft'), ('meaning-247-07-hi', 'token-2-47-07', 'hi', 1, 'किसी भी समय', 'draft'), ('meaning-247-07-or', 'token-2-47-07', 'or', 1, 'କୌଣସି ସମୟରେ', 'draft'),
  ('meaning-247-08-en', 'token-2-47-08', 'en', 1, 'motive or cause of action’s fruit', 'draft'), ('meaning-247-08-hi', 'token-2-47-08', 'hi', 1, 'कर्मफल का हेतु', 'draft'), ('meaning-247-08-or', 'token-2-47-08', 'or', 1, 'କର୍ମଫଳର ହେତୁ', 'draft'),
  ('meaning-247-09-en', 'token-2-47-09', 'en', 1, 'become', 'draft'), ('meaning-247-09-hi', 'token-2-47-09', 'hi', 1, 'बनो', 'draft'), ('meaning-247-09-or', 'token-2-47-09', 'or', 1, 'ହୁଅ', 'draft'),
  ('meaning-247-10-en', 'token-2-47-10', 'en', 1, 'attachment', 'draft'), ('meaning-247-10-hi', 'token-2-47-10', 'hi', 1, 'आसक्ति', 'draft'), ('meaning-247-10-or', 'token-2-47-10', 'or', 1, 'ଆସକ୍ତି', 'draft'),
  ('meaning-247-11-en', 'token-2-47-11', 'en', 1, 'let there be', 'draft'), ('meaning-247-11-hi', 'token-2-47-11', 'hi', 1, 'हो', 'draft'), ('meaning-247-11-or', 'token-2-47-11', 'or', 1, 'ହେଉ', 'draft'),
  ('meaning-247-12-en', 'token-2-47-12', 'en', 1, 'in inaction', 'draft'), ('meaning-247-12-hi', 'token-2-47-12', 'hi', 1, 'अकर्म में', 'draft'), ('meaning-247-12-or', 'token-2-47-12', 'or', 1, 'ଅକର୍ମରେ', 'draft'),
  ('meaning-248-01-en', 'token-2-48-01', 'en', 1, 'established in yoga', 'draft'), ('meaning-248-01-hi', 'token-2-48-01', 'hi', 1, 'योग में स्थित', 'draft'), ('meaning-248-01-or', 'token-2-48-01', 'or', 1, 'ଯୋଗରେ ସ୍ଥିତ', 'draft'),
  ('meaning-248-02-en', 'token-2-48-02', 'en', 1, 'perform', 'draft'), ('meaning-248-02-hi', 'token-2-48-02', 'hi', 1, 'करो', 'draft'), ('meaning-248-02-or', 'token-2-48-02', 'or', 1, 'କର', 'draft'),
  ('meaning-248-03-en', 'token-2-48-03', 'en', 1, 'actions or duties', 'draft'), ('meaning-248-03-hi', 'token-2-48-03', 'hi', 1, 'कर्मों को', 'draft'), ('meaning-248-03-or', 'token-2-48-03', 'or', 1, 'କର୍ମଗୁଡ଼ିକୁ', 'draft'),
  ('meaning-248-04-en', 'token-2-48-04', 'en', 1, 'attachment', 'draft'), ('meaning-248-04-hi', 'token-2-48-04', 'hi', 1, 'आसक्ति को', 'draft'), ('meaning-248-04-or', 'token-2-48-04', 'or', 1, 'ଆସକ୍ତିକୁ', 'draft'),
  ('meaning-248-05-en', 'token-2-48-05', 'en', 1, 'having abandoned', 'draft'), ('meaning-248-05-hi', 'token-2-48-05', 'hi', 1, 'त्यागकर', 'draft'), ('meaning-248-05-or', 'token-2-48-05', 'or', 1, 'ତ୍ୟାଗ କରି', 'draft'),
  ('meaning-248-06-en', 'token-2-48-06', 'en', 1, 'O Dhanañjaya (Arjuna)', 'draft'), ('meaning-248-06-hi', 'token-2-48-06', 'hi', 1, 'हे धनञ्जय', 'draft'), ('meaning-248-06-or', 'token-2-48-06', 'or', 1, 'ହେ ଧନଞ୍ଜୟ', 'draft'),
  ('meaning-248-07-en', 'token-2-48-07', 'en', 1, 'in success and failure', 'draft'), ('meaning-248-07-hi', 'token-2-48-07', 'hi', 1, 'सिद्धि और असिद्धि में', 'draft'), ('meaning-248-07-or', 'token-2-48-07', 'or', 1, 'ସଫଳତା ଓ ବିଫଳତାରେ', 'draft'),
  ('meaning-248-08-en', 'token-2-48-08', 'en', 1, 'equal; even-minded', 'draft'), ('meaning-248-08-hi', 'token-2-48-08', 'hi', 1, 'समान', 'draft'), ('meaning-248-08-or', 'token-2-48-08', 'or', 1, 'ସମଭାବପୂର୍ଣ୍ଣ', 'draft'),
  ('meaning-248-09-en', 'token-2-48-09', 'en', 1, 'having become', 'draft'), ('meaning-248-09-hi', 'token-2-48-09', 'hi', 1, 'होकर', 'draft'), ('meaning-248-09-or', 'token-2-48-09', 'or', 1, 'ହୋଇ', 'draft'),
  ('meaning-248-10-en', 'token-2-48-10', 'en', 1, 'equanimity', 'draft'), ('meaning-248-10-hi', 'token-2-48-10', 'hi', 1, 'समभाव', 'draft'), ('meaning-248-10-or', 'token-2-48-10', 'or', 1, 'ସମତ୍ୱ', 'draft'),
  ('meaning-248-11-en', 'token-2-48-11', 'en', 1, 'yoga', 'draft'), ('meaning-248-11-hi', 'token-2-48-11', 'hi', 1, 'योग', 'draft'), ('meaning-248-11-or', 'token-2-48-11', 'or', 1, 'ଯୋଗ', 'draft'),
  ('meaning-248-12-en', 'token-2-48-12', 'en', 1, 'is called', 'draft'), ('meaning-248-12-hi', 'token-2-48-12', 'hi', 1, 'कहा जाता है', 'draft'), ('meaning-248-12-or', 'token-2-48-12', 'or', 1, 'କୁହାଯାଏ', 'draft')
ON DUPLICATE KEY UPDATE `meaning` = VALUES(`meaning`), `editorial_status` = VALUES(`editorial_status`);

INSERT INTO `commentary_works`
  (`id`, `scripture_work_id`, `commentator_person_id`, `tradition_id`, `slug`, `canonical_title`, `original_language_code`, `source_document_id`)
VALUES
  ('cwork-shankara-gita', 'work-bhagavad-gita', 'person-shankara', 'tradition-advaita', 'shankara-gita-bhasya', 'Bhagavad Gītā Bhāṣya of Ādi Śaṅkarācārya', 'sa', 'source-gita-prototype'),
  ('cwork-ramanuja-gita', 'work-bhagavad-gita', 'person-ramanuja', 'tradition-vishishtadvaita', 'ramanuja-gita-bhasya', 'Bhagavad Gītā Bhāṣya of Śrī Rāmānujācārya', 'sa', 'source-gita-prototype'),
  ('cwork-madhva-gita', 'work-bhagavad-gita', 'person-madhva', 'tradition-dvaita', 'madhva-gita-bhasya', 'Bhagavad Gītā Bhāṣya of Śrī Madhvācārya', 'sa', 'source-gita-prototype'),
  ('cwork-sridhara-gita', 'work-bhagavad-gita', 'person-sridhara', 'tradition-vaishnava', 'sridhara-gita-bhasya', 'Bhagavad Gītā commentary of Śrīdhara Svāmī', 'sa', 'source-gita-prototype')
ON DUPLICATE KEY UPDATE `canonical_title` = VALUES(`canonical_title`), `tradition_id` = VALUES(`tradition_id`), `source_document_id` = VALUES(`source_document_id`);

INSERT INTO `commentary_editions`
  (`id`, `commentary_work_id`, `owner_organisation_id`, `language_code`, `title`, `version_label`, `passage_mode`, `license_id`, `source_document_id`, `publication_status`)
VALUES
  ('cedition-shankara-en-v1', 'cwork-shankara-gita', 'org-living-bliss', 'en', 'Śaṅkara commentary · editorial summary', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype'),
  ('cedition-shankara-hi-v1', 'cwork-shankara-gita', 'org-living-bliss', 'hi', 'शंकराचार्य भाष्य · सम्पादकीय सारांश', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype'),
  ('cedition-shankara-or-v1', 'cwork-shankara-gita', 'org-living-bliss', 'or', 'ଶଙ୍କରାଚାର୍ଯ୍ୟ ଭାଷ୍ୟ · ସମ୍ପାଦକୀୟ ସାରାଂଶ', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype'),
  ('cedition-ramanuja-en-v1', 'cwork-ramanuja-gita', 'org-living-bliss', 'en', 'Rāmānuja commentary · editorial summary', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype'),
  ('cedition-ramanuja-hi-v1', 'cwork-ramanuja-gita', 'org-living-bliss', 'hi', 'रामानुजाचार्य भाष्य · सम्पादकीय सारांश', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype'),
  ('cedition-ramanuja-or-v1', 'cwork-ramanuja-gita', 'org-living-bliss', 'or', 'ରାମାନୁଜାଚାର୍ଯ୍ୟ ଭାଷ୍ୟ · ସମ୍ପାଦକୀୟ ସାରାଂଶ', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype'),
  ('cedition-madhva-en-v1', 'cwork-madhva-gita', 'org-living-bliss', 'en', 'Madhva commentary · editorial summary', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype'),
  ('cedition-madhva-hi-v1', 'cwork-madhva-gita', 'org-living-bliss', 'hi', 'मध्वाचार्य भाष्य · सम्पादकीय सारांश', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype'),
  ('cedition-madhva-or-v1', 'cwork-madhva-gita', 'org-living-bliss', 'or', 'ମଧ୍ୱାଚାର୍ଯ୍ୟ ଭାଷ୍ୟ · ସମ୍ପାଦକୀୟ ସାରାଂଶ', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype'),
  ('cedition-sridhara-en-v1', 'cwork-sridhara-gita', 'org-living-bliss', 'en', 'Śrīdhara commentary · editorial summary', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype'),
  ('cedition-sridhara-hi-v1', 'cwork-sridhara-gita', 'org-living-bliss', 'hi', 'श्रीधर स्वामी टीका · सम्पादकीय सारांश', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype'),
  ('cedition-sridhara-or-v1', 'cwork-sridhara-gita', 'org-living-bliss', 'or', 'ଶ୍ରୀଧର ସ୍ୱାମୀ ଟୀକା · ସମ୍ପାଦକୀୟ ସାରାଂଶ', 'prototype-1', 'summary', 'license-prototype-review', 'source-gita-prototype', 'prototype')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `publication_status` = VALUES(`publication_status`), `source_document_id` = VALUES(`source_document_id`);

INSERT INTO `commentary_passages`
  (`id`, `commentary_edition_id`, `verse_id`, `passage_type`, `text`, `source_locator`, `editorial_status`)
VALUES
  ('cpass-shankara-247-en', 'cedition-shankara-en-v1', 'verse-gita-02-047', 'summary', 'Śaṅkara reads this instruction as addressed to one presently qualified for disciplined action rather than direct establishment in knowledge. Arjuna should act without longing for results, without imagining himself the independent producer of those results, and without using renunciation of fruit as a reason for inaction.', 'Bhagavad Gita 2.47', 'draft'),
  ('cpass-shankara-247-hi', 'cedition-shankara-hi-v1', 'verse-gita-02-047', 'summary', 'शंकराचार्य इस उपदेश को उस साधक के लिए मानते हैं जो अभी अनुशासित कर्म का अधिकारी है, ज्ञाननिष्ठा का नहीं। अर्जुन को फल की इच्छा और स्वयं को फल का स्वतन्त्र उत्पादक मानने का भाव छोड़कर कर्म करना चाहिए; फलत्याग को अकर्म का कारण भी नहीं बनाना चाहिए।', 'भगवद्गीता २.४७', 'draft'),
  ('cpass-shankara-247-or', 'cedition-shankara-or-v1', 'verse-gita-02-047', 'summary', 'ଶଙ୍କରାଚାର୍ଯ୍ୟ ଏହି ଉପଦେଶକୁ ସେହି ସାଧକଙ୍କ ପାଇଁ ବୁଝାନ୍ତି, ଯିଏ ବର୍ତ୍ତମାନ ଜ୍ଞାନନିଷ୍ଠା ଅପେକ୍ଷା ଶୃଙ୍ଖଳିତ କର୍ମର ଅଧିକାରୀ। ଅର୍ଜୁନ ଫଳର ଆକାଂକ୍ଷା ଓ ନିଜକୁ ଫଳର ସ୍ୱାଧୀନ କର୍ତ୍ତା ଭାବିବା ଛାଡ଼ି କର୍ମ କରିବେ; ଫଳତ୍ୟାଗକୁ ଅକର୍ମର କାରଣ କରିବେ ନାହିଁ।', 'ଭଗବଦ୍ ଗୀତା ୨.୪୭', 'draft'),
  ('cpass-ramanuja-247-en', 'cedition-ramanuja-en-v1', 'verse-gita-02-047', 'summary', 'Rāmānuja explains that obligatory and occasional duties are to be performed, while their fruits are not to be claimed. Action offered as worship of the Supreme, without desire for reward or the notion of independent agency, becomes a means toward liberation.', 'Bhagavad Gita 2.47', 'draft'),
  ('cpass-ramanuja-247-hi', 'cedition-ramanuja-hi-v1', 'verse-gita-02-047', 'summary', 'रामानुजाचार्य समझाते हैं कि नित्य और नैमित्तिक कर्तव्यों का पालन करना चाहिए, किन्तु उनके फल पर अधिकार नहीं मानना चाहिए। पुरस्कार की इच्छा और स्वतन्त्र कर्तापन के भाव से रहित, परमात्मा की आराधना के रूप में किया गया कर्म मुक्ति का साधन बनता है।', 'भगवद्गीता २.४७', 'draft'),
  ('cpass-ramanuja-247-or', 'cedition-ramanuja-or-v1', 'verse-gita-02-047', 'summary', 'ରାମାନୁଜାଚାର୍ଯ୍ୟ ବୁଝାନ୍ତି ଯେ ନିତ୍ୟ ଓ ନୈମିତ୍ତିକ କର୍ତ୍ତବ୍ୟ ପାଳନ କରିବା ଉଚିତ, କିନ୍ତୁ ସେଗୁଡ଼ିକର ଫଳ ଉପରେ ଅଧିକାର ଦାବି କରିବା ଉଚିତ ନୁହେଁ। ପୁରସ୍କାରର ଇଚ୍ଛା ଓ ସ୍ୱାଧୀନ କର୍ତ୍ତାଭାବ ବିନା, ପରମାତ୍ମାଙ୍କ ଆରାଧନା ରୂପେ କରାଯାଇଥିବା କର୍ମ ମୁକ୍ତିର ସାଧନ ହୁଏ।', 'ଭଗବଦ୍ ଗୀତା ୨.୪୭', 'draft'),
  ('cpass-madhva-247-en', 'cedition-madhva-en-v1', 'verse-gita-02-047', 'summary', 'Madhva treats the verse as instruction for the aspirant who must continue prescribed action. The result belongs under divine governance; the learner is responsible for duty, not for claiming independent control over its fruit, and must not retreat into inaction.', 'Bhagavad Gita 2.47', 'draft'),
  ('cpass-madhva-247-hi', 'cedition-madhva-hi-v1', 'verse-gita-02-047', 'summary', 'मध्वाचार्य इस श्लोक को उस साधक के लिए निर्देश मानते हैं जिसे नियत कर्म करते रहना है। फल दैवी व्यवस्था के अधीन है; साधक कर्तव्य के लिए उत्तरदायी है, फल पर स्वतन्त्र नियन्त्रण का दावा करने के लिए नहीं, और उसे अकर्म में पीछे नहीं हटना चाहिए।', 'भगवद्गीता २.४७', 'draft'),
  ('cpass-madhva-247-or', 'cedition-madhva-or-v1', 'verse-gita-02-047', 'summary', 'ମଧ୍ୱାଚାର୍ଯ୍ୟ ଏହି ଶ୍ଲୋକକୁ ସେହି ସାଧକଙ୍କ ପାଇଁ ନିର୍ଦ୍ଦେଶ ଭାବେ ଦେଖନ୍ତି, ଯିଏ ନିର୍ଦ୍ଧାରିତ କର୍ମ କରିଚାଲିବା ଉଚିତ। ଫଳ ଦୈବୀ ବ୍ୟବସ୍ଥାର ଅଧୀନ; ସାଧକ କର୍ତ୍ତବ୍ୟ ପାଇଁ ଦାୟୀ, ଫଳ ଉପରେ ସ୍ୱାଧୀନ ନିୟନ୍ତ୍ରଣ ଦାବି ପାଇଁ ନୁହେଁ, ଏବଂ ଅକର୍ମକୁ ପଛକୁ ହଟିବା ଉଚିତ ନୁହେଁ।', 'ଭଗବଦ୍ ଗୀତା ୨.୪୭', 'draft'),
  ('cpass-sridhara-247-en', 'cedition-sridhara-en-v1', 'verse-gita-02-047', 'summary', 'Śrīdhara emphasises eligibility for action rather than ownership of results. One should perform duty as an offering, abandon identification with the cause of the fruit, and avoid attachment to neglecting action.', 'Bhagavad Gita 2.47', 'draft'),
  ('cpass-sridhara-247-hi', 'cedition-sridhara-hi-v1', 'verse-gita-02-047', 'summary', 'श्रीधर स्वामी कर्म की पात्रता पर बल देते हैं, फल के स्वामित्व पर नहीं। कर्तव्य को अर्पण के रूप में करना, फल का कारण होने की पहचान छोड़ना और कर्म की उपेक्षा से आसक्ति न रखना चाहिए।', 'भगवद्गीता २.४७', 'draft'),
  ('cpass-sridhara-247-or', 'cedition-sridhara-or-v1', 'verse-gita-02-047', 'summary', 'ଶ୍ରୀଧର ସ୍ୱାମୀ ଫଳର ସ୍ୱାମିତ୍ୱ ବଦଳରେ କର୍ମର ଅଧିକାର ଉପରେ ଗୁରୁତ୍ୱ ଦିଅନ୍ତି। କର୍ତ୍ତବ୍ୟକୁ ଅର୍ପଣ ରୂପେ କରିବା, ଫଳର କାରଣ ହେବାର ଚିହ୍ନଟ ଛାଡ଼ିବା ଓ କର୍ମ ଅବହେଳାରେ ଆସକ୍ତ ନ ହେବା ଉଚିତ।', 'ଭଗବଦ୍ ଗୀତା ୨.୪୭', 'draft'),
  ('cpass-shankara-248-en', 'cedition-shankara-en-v1', 'verse-gita-02-048', 'summary', 'For Śaṅkara, being established in yoga means performing duty for the Divine while relinquishing thirst for results and insistence on personal agency. The practitioner remains even-minded whether action brings success or failure; this equanimity is yoga.', 'Bhagavad Gita 2.48', 'draft'),
  ('cpass-shankara-248-hi', 'cedition-shankara-hi-v1', 'verse-gita-02-048', 'summary', 'शंकराचार्य के अनुसार योग में स्थित होने का अर्थ है फल की तृष्णा और व्यक्तिगत कर्तापन का आग्रह छोड़कर ईश्वर के लिए कर्तव्य करना। कर्म में सिद्धि हो या असिद्धि, साधक समभाव रखता है; यही समत्व योग है।', 'भगवद्गीता २.४८', 'draft'),
  ('cpass-shankara-248-or', 'cedition-shankara-or-v1', 'verse-gita-02-048', 'summary', 'ଶଙ୍କରାଚାର୍ଯ୍ୟଙ୍କ ମତରେ ଯୋଗରେ ସ୍ଥିତ ହେବାର ଅର୍ଥ ହେଉଛି ଫଳର ତୃଷ୍ଣା ଓ ବ୍ୟକ୍ତିଗତ କର୍ତ୍ତାଭାବର ଆଗ୍ରହ ଛାଡ଼ି ଈଶ୍ୱରଙ୍କ ପାଇଁ କର୍ତ୍ତବ୍ୟ କରିବା। କର୍ମରେ ସଫଳତା ବା ବିଫଳତା ଯାହା ଆସୁ, ସାଧକ ସମଭାବରେ ରହନ୍ତି; ଏହି ସମତ୍ୱ ହିଁ ଯୋଗ।', 'ଭଗବଦ୍ ଗୀତା ୨.୪୮', 'draft'),
  ('cpass-ramanuja-248-en', 'cedition-ramanuja-en-v1', 'verse-gita-02-048', 'summary', 'Rāmānuja applies the teaching directly to Arjuna: abandon attachment to kingdom, relatives and the outcome of battle, yet perform the required action. Mental steadiness in victory and defeat is the yoga named here.', 'Bhagavad Gita 2.48', 'draft'),
  ('cpass-ramanuja-248-hi', 'cedition-ramanuja-hi-v1', 'verse-gita-02-048', 'summary', 'रामानुजाचार्य इस शिक्षा को सीधे अर्जुन पर लागू करते हैं—राज्य, सम्बन्धियों और युद्ध के परिणाम की आसक्ति छोड़कर भी आवश्यक कर्म करो। विजय और पराजय में मन की समान स्थिरता को ही यहाँ योग कहा गया है।', 'भगवद्गीता २.४८', 'draft'),
  ('cpass-ramanuja-248-or', 'cedition-ramanuja-or-v1', 'verse-gita-02-048', 'summary', 'ରାମାନୁଜାଚାର୍ଯ୍ୟ ଏହି ଶିକ୍ଷାକୁ ସିଧାସଳଖ ଅର୍ଜୁନଙ୍କ ସହ ଯୋଡ଼ନ୍ତି—ରାଜ୍ୟ, ସମ୍ପର୍କୀୟ ଓ ଯୁଦ୍ଧର ଫଳ ପ୍ରତି ଆସକ୍ତି ତ୍ୟାଗ କରି ମଧ୍ୟ ଆବଶ୍ୟକ କର୍ମ କର। ବିଜୟ ଓ ପରାଜୟରେ ମନର ସମାନ ସ୍ଥିରତାକୁ ଏଠାରେ ଯୋଗ କୁହାଯାଇଛି।', 'ଭଗବଦ୍ ଗୀତା ୨.୪୮', 'draft'),
  ('cpass-madhva-248-en', 'cedition-madhva-en-v1', 'verse-gita-02-048', 'summary', 'Madhva reads this verse as a clarification of 2.47: remain established in the spiritual means, abandon affection for the fruit, and be equal in success and failure. Such evenness is the yoga taught by Krishna.', 'Bhagavad Gita 2.48', 'draft'),
  ('cpass-madhva-248-hi', 'cedition-madhva-hi-v1', 'verse-gita-02-048', 'summary', 'मध्वाचार्य इस श्लोक को २.४७ की स्पष्टता के रूप में पढ़ते हैं—आध्यात्मिक साधन में स्थित रहो, फल के प्रति स्नेह छोड़ो और सिद्धि-असिद्धि में समान रहो। ऐसी समता ही श्रीकृष्ण द्वारा सिखाया गया योग है।', 'भगवद्गीता २.४८', 'draft'),
  ('cpass-madhva-248-or', 'cedition-madhva-or-v1', 'verse-gita-02-048', 'summary', 'ମଧ୍ୱାଚାର୍ଯ୍ୟ ଏହି ଶ୍ଲୋକକୁ ୨.୪୭ର ସ୍ପଷ୍ଟୀକରଣ ଭାବେ ପଢ଼ନ୍ତି—ଆଧ୍ୟାତ୍ମିକ ସାଧନରେ ସ୍ଥିତ ରୁହ, ଫଳ ପ୍ରତି ସ୍ନେହ ଛାଡ଼ ଏବଂ ସଫଳତା-ବିଫଳତାରେ ସମାନ ରୁହ। ଏପରି ସମତା ହିଁ ଶ୍ରୀକୃଷ୍ଣ ଶିଖାଇଥିବା ଯୋଗ।', 'ଭଗବଦ୍ ଗୀତା ୨.୪୮', 'draft'),
  ('cpass-sridhara-248-en', 'cedition-sridhara-en-v1', 'verse-gita-02-048', 'summary', 'Śrīdhara describes yoga as single-minded orientation toward the Supreme. Action is offered without possessive agency, and even the success or failure of its spiritual fruit is met with equal-mindedness.', 'Bhagavad Gita 2.48', 'draft'),
  ('cpass-sridhara-248-hi', 'cedition-sridhara-hi-v1', 'verse-gita-02-048', 'summary', 'श्रीधर स्वामी योग को परमात्मा के प्रति एकनिष्ठता बताते हैं। कर्म स्वामित्व और कर्तापन के आग्रह के बिना अर्पित किया जाता है, और उसके आध्यात्मिक फल की सिद्धि-असिद्धि को भी समभाव से स्वीकार किया जाता है।', 'भगवद्गीता २.४८', 'draft'),
  ('cpass-sridhara-248-or', 'cedition-sridhara-or-v1', 'verse-gita-02-048', 'summary', 'ଶ୍ରୀଧର ସ୍ୱାମୀ ଯୋଗକୁ ପରମାତ୍ମାଙ୍କ ପ୍ରତି ଏକନିଷ୍ଠତା ଭାବେ ବର୍ଣ୍ଣନା କରନ୍ତି। ସ୍ୱାମିତ୍ୱ ଓ କର୍ତ୍ତାଭାବର ଆଗ୍ରହ ବିନା କର୍ମ ଅର୍ପଣ କରାଯାଏ, ଏବଂ ତାହାର ଆଧ୍ୟାତ୍ମିକ ଫଳର ସଫଳତା ବା ବିଫଳତାକୁ ମଧ୍ୟ ସମଭାବରେ ଗ୍ରହଣ କରାଯାଏ।', 'ଭଗବଦ୍ ଗୀତା ୨.୪୮', 'draft')
ON DUPLICATE KEY UPDATE `text` = VALUES(`text`), `source_locator` = VALUES(`source_locator`), `editorial_status` = VALUES(`editorial_status`);

INSERT INTO `publication_commentary_editions`
  (`publication_profile_id`, `commentary_edition_id`, `display_order`, `is_enabled`)
VALUES
  ('profile-lb-gita-general', 'cedition-shankara-en-v1', 1, true), ('profile-lb-gita-general', 'cedition-shankara-hi-v1', 1, true), ('profile-lb-gita-general', 'cedition-shankara-or-v1', 1, true),
  ('profile-lb-gita-general', 'cedition-ramanuja-en-v1', 2, true), ('profile-lb-gita-general', 'cedition-ramanuja-hi-v1', 2, true), ('profile-lb-gita-general', 'cedition-ramanuja-or-v1', 2, true),
  ('profile-lb-gita-general', 'cedition-madhva-en-v1', 3, true), ('profile-lb-gita-general', 'cedition-madhva-hi-v1', 3, true), ('profile-lb-gita-general', 'cedition-madhva-or-v1', 3, true),
  ('profile-lb-gita-general', 'cedition-sridhara-en-v1', 4, true), ('profile-lb-gita-general', 'cedition-sridhara-hi-v1', 4, true), ('profile-lb-gita-general', 'cedition-sridhara-or-v1', 4, true)
ON DUPLICATE KEY UPDATE `display_order` = VALUES(`display_order`), `is_enabled` = VALUES(`is_enabled`);

INSERT INTO `courses`
  (`id`, `owner_organisation_id`, `publication_profile_id`, `scripture_work_id`, `slug`, `course_type`, `audience_type`, `status`)
VALUES
  ('course-gita-foundations', 'org-living-bliss', 'profile-lb-gita-general', 'work-bhagavad-gita', 'gita-foundations', 'self-paced', 'general', 'prototype')
ON DUPLICATE KEY UPDATE `publication_profile_id` = VALUES(`publication_profile_id`), `status` = VALUES(`status`);

INSERT INTO `course_localizations`
  (`course_id`, `language_code`, `title`, `short_description`, `full_description`, `learning_outcomes`)
VALUES
  ('course-gita-foundations', 'en', 'Bhagavad Gita: Foundations', 'A guided, edition-aware journey through all eighteen chapters.', 'Build the background needed for respectful study, then progress verse by verse through the Bhagavad Gita with script, transliteration, Sandhi, word meanings, translation and approved commentary.', JSON_ARRAY('Understand the setting and key terms', 'Read each verse in structured layers', 'Compare approved commentarial traditions', 'Complete chapter assessments')),
  ('course-gita-foundations', 'hi', 'भगवद्गीता: आधार पाठ्यक्रम', 'सभी अठारह अध्यायों की संस्करण-सचेत मार्गदर्शित यात्रा।', 'सम्मानपूर्ण अध्ययन की पृष्ठभूमि बनाइए, फिर लिपि, लिप्यंतरण, सन्धि-विच्छेद, शब्दार्थ, अनुवाद और अनुमोदित भाष्य के साथ श्लोक-दर-श्लोक आगे बढ़िए।', JSON_ARRAY('प्रसंग और मुख्य शब्द समझना', 'हर श्लोक को व्यवस्थित स्तरों में पढ़ना', 'अनुमोदित भाष्य परम्पराओं की तुलना करना', 'अध्याय मूल्यांकन पूरा करना')),
  ('course-gita-foundations', 'or', 'ଭଗବଦ୍ ଗୀତା: ମୌଳିକ ପାଠ୍ୟକ୍ରମ', 'ସମସ୍ତ ଅଠରଟି ଅଧ୍ୟାୟର ଏକ ମାର୍ଗଦର୍ଶିତ, ସଂସ୍କରଣ-ସଚେତନ ଯାତ୍ରା।', 'ସମ୍ମାନପୂର୍ଣ୍ଣ ଅଧ୍ୟୟନ ପାଇଁ ପୃଷ୍ଠଭୂମି ଗଢ଼ନ୍ତୁ, ତାପରେ ଲିପି, ଲିପ୍ୟନ୍ତରଣ, ସନ୍ଧି ବିଚ୍ଛେଦ, ଶବ୍ଦାର୍ଥ, ଅନୁବାଦ ଓ ଅନୁମୋଦିତ ଭାଷ୍ୟ ସହ ଶ୍ଲୋକ ପରେ ଶ୍ଲୋକ ଆଗକୁ ବଢ଼ନ୍ତୁ।', JSON_ARRAY('ପ୍ରସଙ୍ଗ ଓ ମୁଖ୍ୟ ଶବ୍ଦ ବୁଝିବା', 'ପ୍ରତ୍ୟେକ ଶ୍ଲୋକକୁ ବ୍ୟବସ୍ଥିତ ସ୍ତରରେ ପଢ଼ିବା', 'ଅନୁମୋଦିତ ଭାଷ୍ୟ ପରମ୍ପରା ତୁଳନା କରିବା', 'ଅଧ୍ୟାୟ ମୂଲ୍ୟାଙ୍କନ ସମ୍ପୂର୍ଣ୍ଣ କରିବା'))
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `full_description` = VALUES(`full_description`), `learning_outcomes` = VALUES(`learning_outcomes`);

INSERT INTO `course_releases`
  (`id`, `course_id`, `version_label`, `default_scripture_release_id`, `publication_status`, `passing_percentage`, `estimated_minutes`, `release_notes`)
VALUES
  ('course-release-gita-proto-1', 'course-gita-foundations', 'prototype-1', 'release-lb-gita-prototype-1', 'prototype', 60, 1200, 'Initial future-state course structure with representative Chapter 2 content.')
ON DUPLICATE KEY UPDATE `default_scripture_release_id` = VALUES(`default_scripture_release_id`), `publication_status` = VALUES(`publication_status`), `release_notes` = VALUES(`release_notes`);

INSERT INTO `course_modules`
  (`id`, `course_release_id`, `scripture_chapter_id`, `slug`, `module_type`, `sequence`, `is_required`, `status`)
VALUES
  ('module-gita-foundations', 'course-release-gita-proto-1', NULL, 'foundations', 'foundation', 1, true, 'prototype'),
  ('module-gita-chapter-02', 'course-release-gita-proto-1', 'chapter-gita-02', 'chapter-2', 'scripture-chapter', 3, true, 'prototype')
ON DUPLICATE KEY UPDATE `scripture_chapter_id` = VALUES(`scripture_chapter_id`), `sequence` = VALUES(`sequence`), `status` = VALUES(`status`);

INSERT INTO `course_module_localizations`
  (`module_id`, `language_code`, `title`, `description`, `essential_question`)
VALUES
  ('module-gita-foundations', 'en', 'Foundations', 'Background knowledge, key people, terms and how to read a verse.', 'What foundation helps a learner begin respectful and informed study?'),
  ('module-gita-foundations', 'hi', 'आधार', 'पृष्ठभूमि ज्ञान, प्रमुख व्यक्तित्व, शब्द और श्लोक पढ़ने की विधि।', 'सम्मानपूर्ण और सूचित अध्ययन आरम्भ करने के लिए कौन-सा आधार आवश्यक है?'),
  ('module-gita-foundations', 'or', 'ମୌଳିକ ପରିଚୟ', 'ପୃଷ୍ଠଭୂମି ଜ୍ଞାନ, ମୁଖ୍ୟ ବ୍ୟକ୍ତିତ୍ୱ, ଶବ୍ଦ ଓ ଶ୍ଲୋକ ପଢ଼ିବା ପଦ୍ଧତି।', 'ସମ୍ମାନପୂର୍ଣ୍ଣ ଓ ସଚେତନ ଅଧ୍ୟୟନ ଆରମ୍ଭ ପାଇଁ କେଉଁ ଭିତ୍ତି ଆବଶ୍ୟକ?'),
  ('module-gita-chapter-02', 'en', 'Chapter 2 · Sāṅkhya Yoga', 'Self, steadiness, right action and foundational teachings.', 'What changes when action is guided by clear understanding rather than fear of results?'),
  ('module-gita-chapter-02', 'hi', 'अध्याय २ · सांख्य योग', 'आत्मा, स्थिरता, उचित कर्म और आधारभूत शिक्षाएँ।', 'जब कर्म फल के भय के बजाय स्पष्ट समझ से निर्देशित हो तो क्या बदलता है?'),
  ('module-gita-chapter-02', 'or', 'ଅଧ୍ୟାୟ ୨ · ସାଂଖ୍ୟ ଯୋଗ', 'ଆତ୍ମା, ସ୍ଥିରତା, ସଠିକ୍ କର୍ମ ଓ ମୌଳିକ ଶିକ୍ଷା।', 'ଫଳର ଭୟ ବଦଳରେ ସ୍ପଷ୍ଟ ବୁଝାମଣା କର୍ମକୁ ନେତୃତ୍ୱ ଦେଲେ କଣ ବଦଳେ?')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`), `essential_question` = VALUES(`essential_question`);

INSERT INTO `lessons`
  (`id`, `module_id`, `scripture_verse_id`, `slug`, `lesson_type`, `sequence`, `estimated_minutes`, `is_required`, `status`)
VALUES
  ('lesson-gita-2-47', 'module-gita-chapter-02', 'verse-gita-02-047', 'gita-2-47', 'verse-study', 47, 12, true, 'prototype'),
  ('lesson-gita-2-48', 'module-gita-chapter-02', 'verse-gita-02-048', 'gita-2-48', 'verse-study', 48, 12, true, 'prototype')
ON DUPLICATE KEY UPDATE `scripture_verse_id` = VALUES(`scripture_verse_id`), `sequence` = VALUES(`sequence`), `status` = VALUES(`status`);

INSERT INTO `lesson_localizations`
  (`lesson_id`, `language_code`, `title`, `objective`, `scene_context`, `completion_message`)
VALUES
  ('lesson-gita-2-47', 'en', 'Bhagavad Gita 2.47', 'Understand disciplined action without possessive attachment to results.', 'On the battlefield, Krishna redirects Arjuna from anxiety about results toward disciplined responsibility for right action.', 'Complete the study and continue to shloka 2.48.'),
  ('lesson-gita-2-47', 'hi', 'भगवद्गीता २.४७', 'फल पर स्वामित्व की आसक्ति के बिना अनुशासित कर्म को समझना।', 'युद्धभूमि में श्रीकृष्ण अर्जुन का ध्यान फल की चिंता से हटाकर उचित कर्म के अनुशासित उत्तरदायित्व की ओर ले जाते हैं।', 'अध्ययन पूरा करें और श्लोक २.४८ पर जाएँ।'),
  ('lesson-gita-2-47', 'or', 'ଭଗବଦ୍ ଗୀତା ୨.୪୭', 'ଫଳ ଉପରେ ମାଲିକାନା ଆସକ୍ତି ବିନା ଶୃଙ୍ଖଳିତ କର୍ମକୁ ବୁଝିବା।', 'ଯୁଦ୍ଧଭୂମିରେ ଶ୍ରୀକୃଷ୍ଣ ଅର୍ଜୁନଙ୍କୁ ଫଳର ଚିନ୍ତାରୁ ସଠିକ୍ କର୍ମର ଶୃଙ୍ଖଳିତ ଦାୟିତ୍ୱ ପ୍ରତି ନେଇଯାଆନ୍ତି।', 'ଅଧ୍ୟୟନ ସମ୍ପୂର୍ଣ୍ଣ କରି ଶ୍ଲୋକ ୨.୪୮କୁ ଯାଆନ୍ତୁ।'),
  ('lesson-gita-2-48', 'en', 'Bhagavad Gita 2.48', 'Understand equanimity in success and failure as yoga.', 'Krishna continues the teaching by describing the inner steadiness with which Arjuna is to perform his duty.', 'Complete the study. The assessment becomes available after the chapter.'),
  ('lesson-gita-2-48', 'hi', 'भगवद्गीता २.४८', 'सफलता और असफलता में समभाव को योग के रूप में समझना।', 'श्रीकृष्ण उस आन्तरिक स्थिरता का वर्णन करते हुए शिक्षा आगे बढ़ाते हैं जिसके साथ अर्जुन को अपना कर्तव्य करना है।', 'अध्ययन पूरा करें। अध्याय के अंत में मूल्यांकन उपलब्ध होगा।'),
  ('lesson-gita-2-48', 'or', 'ଭଗବଦ୍ ଗୀତା ୨.୪୮', 'ସଫଳତା ଓ ବିଫଳତାରେ ସମଭାବକୁ ଯୋଗ ଭାବେ ବୁଝିବା।', 'ଅର୍ଜୁନ ଯେଉଁ ଆନ୍ତରିକ ସ୍ଥିରତା ସହ ନିଜ କର୍ତ୍ତବ୍ୟ କରିବେ, ଶ୍ରୀକୃଷ୍ଣ ତାହା ବର୍ଣ୍ଣନା କରି ଶିକ୍ଷାକୁ ଆଗକୁ ବଢ଼ାନ୍ତି।', 'ଅଧ୍ୟୟନ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ। ଅଧ୍ୟାୟ ଶେଷରେ ମୂଲ୍ୟାଙ୍କନ ଉପଲବ୍ଧ ହେବ।')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `objective` = VALUES(`objective`), `scene_context` = VALUES(`scene_context`), `completion_message` = VALUES(`completion_message`);

INSERT INTO `lesson_content_blocks`
  (`id`, `lesson_id`, `block_type`, `sequence`, `source_entity_type`, `source_entity_id`, `required_for_completion`, `configuration`)
VALUES
  ('block-247-scripture', 'lesson-gita-2-47', 'verse-scripture', 1, 'scripture-verse', 'verse-gita-02-047', true, JSON_OBJECT('representations', JSON_ARRAY('canonical-script', 'transliteration'))),
  ('block-247-sandhi', 'lesson-gita-2-47', 'sandhi-vicheda', 2, 'sandhi-analysis', 'sandhi-gita-2-47-v1', true, NULL),
  ('block-247-meaning', 'lesson-gita-2-47', 'word-meanings', 3, 'sandhi-analysis', 'sandhi-gita-2-47-v1', true, NULL),
  ('block-247-translation', 'lesson-gita-2-47', 'translation', 4, 'scripture-verse', 'verse-gita-02-047', true, NULL),
  ('block-247-commentary', 'lesson-gita-2-47', 'commentary-selector', 5, 'scripture-verse', 'verse-gita-02-047', false, NULL),
  ('block-247-read-aloud', 'lesson-gita-2-47', 'read-aloud', 6, 'scripture-verse', 'verse-gita-02-047', false, JSON_OBJECT('include', JSON_ARRAY('scripture', 'word-meanings', 'translation'))),
  ('block-248-scripture', 'lesson-gita-2-48', 'verse-scripture', 1, 'scripture-verse', 'verse-gita-02-048', true, JSON_OBJECT('representations', JSON_ARRAY('canonical-script', 'transliteration'))),
  ('block-248-sandhi', 'lesson-gita-2-48', 'sandhi-vicheda', 2, 'sandhi-analysis', 'sandhi-gita-2-48-v1', true, NULL),
  ('block-248-meaning', 'lesson-gita-2-48', 'word-meanings', 3, 'sandhi-analysis', 'sandhi-gita-2-48-v1', true, NULL),
  ('block-248-translation', 'lesson-gita-2-48', 'translation', 4, 'scripture-verse', 'verse-gita-02-048', true, NULL),
  ('block-248-commentary', 'lesson-gita-2-48', 'commentary-selector', 5, 'scripture-verse', 'verse-gita-02-048', false, NULL),
  ('block-248-read-aloud', 'lesson-gita-2-48', 'read-aloud', 6, 'scripture-verse', 'verse-gita-02-048', false, JSON_OBJECT('include', JSON_ARRAY('scripture', 'word-meanings', 'translation')))
ON DUPLICATE KEY UPDATE `source_entity_id` = VALUES(`source_entity_id`), `required_for_completion` = VALUES(`required_for_completion`), `configuration` = VALUES(`configuration`);

INSERT INTO `lesson_prerequisites` (`lesson_id`, `prerequisite_lesson_id`, `rule_type`) VALUES
  ('lesson-gita-2-48', 'lesson-gita-2-47', 'complete')
ON DUPLICATE KEY UPDATE `rule_type` = VALUES(`rule_type`);

INSERT INTO `assessments`
  (`id`, `course_release_id`, `module_id`, `slug`, `assessment_type`, `passing_percentage`, `maximum_attempts`, `randomize_questions`, `status`)
VALUES
  ('assessment-gita-chapter-02', 'course-release-gita-proto-1', 'module-gita-chapter-02', 'gita-chapter-2', 'chapter', 60, NULL, false, 'prototype')
ON DUPLICATE KEY UPDATE `passing_percentage` = VALUES(`passing_percentage`), `status` = VALUES(`status`);

INSERT INTO `assessment_localizations`
  (`assessment_id`, `language_code`, `title`, `instructions`, `pass_message`, `retry_message`)
VALUES
  ('assessment-gita-chapter-02', 'en', 'Chapter 2 assessment', 'Complete the prescribed chapter lessons before beginning.', 'You have demonstrated the chapter learning outcomes.', 'Review the chapter and try again when ready.'),
  ('assessment-gita-chapter-02', 'hi', 'अध्याय २ मूल्यांकन', 'आरम्भ करने से पहले निर्धारित अध्याय पाठ पूरे करें।', 'आपने अध्याय के अधिगम परिणाम प्रदर्शित किए हैं।', 'अध्याय की पुनरावृत्ति करें और तैयार होने पर फिर प्रयास करें।'),
  ('assessment-gita-chapter-02', 'or', 'ଅଧ୍ୟାୟ ୨ ମୂଲ୍ୟାଙ୍କନ', 'ଆରମ୍ଭ କରିବା ପୂର୍ବରୁ ନିର୍ଦ୍ଧାରିତ ଅଧ୍ୟାୟ ପାଠ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ।', 'ଆପଣ ଅଧ୍ୟାୟର ଶିକ୍ଷଣ ଫଳ ପ୍ରଦର୍ଶନ କରିଛନ୍ତି।', 'ଅଧ୍ୟାୟ ପୁନରାବଲୋକନ କରି ପ୍ରସ୍ତୁତ ହେଲେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `instructions` = VALUES(`instructions`), `pass_message` = VALUES(`pass_message`), `retry_message` = VALUES(`retry_message`);

INSERT INTO `assessment_questions`
  (`id`, `assessment_id`, `scripture_verse_id`, `question_type`, `sequence`, `points`, `status`)
VALUES
  ('question-gita-02-001', 'assessment-gita-chapter-02', 'verse-gita-02-047', 'single-choice', 1, 1, 'active')
ON DUPLICATE KEY UPDATE `scripture_verse_id` = VALUES(`scripture_verse_id`), `sequence` = VALUES(`sequence`), `status` = VALUES(`status`);

INSERT INTO `assessment_question_localizations` (`question_id`, `language_code`, `prompt`, `explanation`) VALUES
  ('question-gita-02-001', 'en', 'According to Bhagavad Gita 2.47, where does the learner’s responsibility lie?', 'The verse directs attention to disciplined action rather than possessive control over results.'),
  ('question-gita-02-001', 'hi', 'भगवद्गीता २.४७ के अनुसार साधक का उत्तरदायित्व कहाँ है?', 'श्लोक फल पर स्वामित्व के बजाय अनुशासित कर्म की ओर ध्यान देता है।'),
  ('question-gita-02-001', 'or', 'ଭଗବଦ୍ ଗୀତା ୨.୪୭ ଅନୁସାରେ ଶିକ୍ଷାର୍ଥୀଙ୍କ ଦାୟିତ୍ୱ କେଉଁଠି?', 'ଶ୍ଲୋକ ଫଳ ଉପରେ ମାଲିକାନା ବଦଳରେ ଶୃଙ୍ଖଳିତ କର୍ମ ପ୍ରତି ଧ୍ୟାନ ଦିଏ।')
ON DUPLICATE KEY UPDATE `prompt` = VALUES(`prompt`), `explanation` = VALUES(`explanation`);

INSERT INTO `assessment_options` (`id`, `question_id`, `sequence`, `is_correct`, `score_value`) VALUES
  ('option-gita-02-001-a', 'question-gita-02-001', 1, true, 1),
  ('option-gita-02-001-b', 'question-gita-02-001', 2, false, 0),
  ('option-gita-02-001-c', 'question-gita-02-001', 3, false, 0)
ON DUPLICATE KEY UPDATE `is_correct` = VALUES(`is_correct`), `score_value` = VALUES(`score_value`);

INSERT INTO `assessment_option_localizations` (`option_id`, `language_code`, `label`, `feedback`) VALUES
  ('option-gita-02-001-a', 'en', 'In performing the right action or duty', 'Correct.'),
  ('option-gita-02-001-a', 'hi', 'उचित कर्म या कर्तव्य करने में', 'सही।'),
  ('option-gita-02-001-a', 'or', 'ସଠିକ୍ କର୍ମ ବା କର୍ତ୍ତବ୍ୟ କରିବାରେ', 'ଠିକ୍।'),
  ('option-gita-02-001-b', 'en', 'In controlling every result', 'The verse distinguishes action from ownership of its result.'),
  ('option-gita-02-001-b', 'hi', 'हर फल को नियन्त्रण करने में', 'श्लोक कर्म और उसके फल के स्वामित्व में भेद करता है।'),
  ('option-gita-02-001-b', 'or', 'ପ୍ରତ୍ୟେକ ଫଳକୁ ନିୟନ୍ତ୍ରଣ କରିବାରେ', 'ଶ୍ଲୋକ କର୍ମ ଓ ତାହାର ଫଳର ମାଲିକାନା ମଧ୍ୟରେ ଭେଦ କରେ।'),
  ('option-gita-02-001-c', 'en', 'In avoiding all action', 'The verse explicitly warns against attachment to inaction.'),
  ('option-gita-02-001-c', 'hi', 'सभी कर्म से बचने में', 'श्लोक अकर्म में आसक्ति से स्पष्ट रूप से सावधान करता है।'),
  ('option-gita-02-001-c', 'or', 'ସମସ୍ତ କର୍ମକୁ ଏଡ଼ାଇବାରେ', 'ଶ୍ଲୋକ ଅକର୍ମରେ ଆସକ୍ତି ବିଷୟରେ ସ୍ପଷ୍ଟ ସତର୍କ କରେ।')
ON DUPLICATE KEY UPDATE `label` = VALUES(`label`), `feedback` = VALUES(`feedback`);

INSERT INTO `ai_policies`
  (`id`, `organisation_id`, `course_release_id`, `policy_version`, `response_mode`, `minimum_age`, `allowed_question_categories`, `blocked_question_categories`, `store_conversations`, `retention_days`, `provider_reference`, `safety_configuration`, `enabled`)
VALUES
  ('ai-policy-lb-gita-proto-1', 'org-living-bliss', 'course-release-gita-proto-1', 'prototype-1', 'retrieval-only', 13,
   JSON_ARRAY('course-navigation', 'scripture-explanation', 'word-meaning', 'approved-commentary-comparison'),
   JSON_ARRAY('medical-advice', 'legal-advice', 'financial-advice', 'unapproved-scripture-generation'),
   false, 0, NULL, JSON_OBJECT('requireCitations', true, 'refuseUngroundedClaims', true, 'minorEscalation', true), true)
ON DUPLICATE KEY UPDATE `response_mode` = VALUES(`response_mode`), `safety_configuration` = VALUES(`safety_configuration`), `enabled` = VALUES(`enabled`);

-- Seed completion marker used by deployment checks.
SELECT 'Living Bliss Bhagavad Gita prototype seed completed' AS `result`;
