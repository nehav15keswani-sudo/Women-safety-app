export interface SimplifiedLawRight {
  id: string;
  iconName: string;
  badge: string;
  targetAudience: 'all' | 'women' | 'men';
  titleEn: string;
  titleHi: string;
  plainSummaryEn: string;
  plainSummaryHi: string;
  voiceScriptEn: string;
  voiceScriptHi: string;
  actionPointsEn: string[];
  actionPointsHi: string[];
  helplineNumber: string;
  helplineLabel: string;
}

export const SIMPLIFIED_LEGAL_RIGHTS: SimplifiedLawRight[] = [
  // --- FOR EVERYONE (MEN & WOMEN) ---
  {
    id: 'right_police_arrest_rights',
    iconName: 'Scale',
    badge: 'Men & Women • Police Rule',
    targetAudience: 'all',
    titleEn: 'Right Against Illegal Police Arrest & Right to Call Family',
    titleHi: 'मनमाने अरेस्ट के खिलाफ अधिकार — परिवार को फोन करने का हक',
    plainSummaryEn: 'Police cannot arrest any citizen without stating the exact legal reason. You have the right to inform your family within 1 hour.',
    plainSummaryHi: 'बिना कानूनी कारण बताए पुलिस किसी भी व्यक्ति (पुरुष या महिला) को गिरफ्तार नहीं कर सकती। थाने में आते ही 1 घंटे के अंदर अपने परिवार या वकील को फोन करने का आपका कानूनी हक है।',
    voiceScriptEn: 'Important legal protection for both men and women. If a police officer stops or detains you, they must state their name, badge number, and the exact crime you are accused of. By Supreme Court order, police must allow you to call a family member or advocate within one hour. They cannot keep you in custody beyond 24 hours without presenting you before a judge.',
    voiceScriptHi: 'पुरुष और महिला दोनों ध्यान से सुनें। सुप्रीम कोर्ट के डीके बसु दिशा-निर्देशों के अनुसार पुलिस बिना कारण बताए किसी को हिरासत में नहीं रख सकती। पुलिस को अपनी वर्दी पर नेमप्लेट लगाना अनिवार्य है और आपको 1 घंटे के अंदर अपने घर पर फोन करने देना होगा। 24 घंटे से ज्यादा कोई आपको थाने में नहीं रोक सकता।',
    actionPointsEn: [
      'Police must clearly disclose the grounds of arrest and whether the offense is bailable.',
      'Right to notify a family member, friend, or advocate immediately (BNSS / CrPC Sec 50A).',
      'Mandatory medical examination by a doctor to prevent custodial assault.',
      'Must be produced before a Judicial Magistrate within 24 hours.'
    ],
    actionPointsHi: [
      'पुलिस को अरेस्ट की वजह और यह जमानती जुर्म है या नहीं, साफ-साफ बताना होगा।',
      'गिरफ्तारी के 1 घंटे के भीतर अपने परिवार या वकील को सूचित करने का अधिकार है।',
      'थाने में किसी भी मारपीट से बचने के लिए सरकारी डॉक्टर से मेडिकल जांच कराने का हक।',
      '24 घंटे के अंदर मजिस्ट्रेट जज के सामने पेश करना अनिवार्य है।'
    ],
    helplineNumber: '112',
    helplineLabel: 'National Police Helpline: 112',
  },
  {
    id: 'right_cyber_blackmail_men_women',
    iconName: 'ShieldAlert',
    badge: 'Men & Women • Cyber Law',
    targetAudience: 'all',
    titleEn: 'Protection Against Cyber Blackmail, Honeytraps & Loan Scams',
    titleHi: 'साइबर ब्लैकमेल, हनीट्रैप व लोन ऐप फ्रॉड से सुरक्षा',
    plainSummaryEn: 'Extortion via video calls, deepfakes, nude leaks, or unauthorized loan apps is a severe crime. Call 1930 to freeze accounts.',
    plainSummaryHi: 'वीडियो कॉल ब्लैकमेल, फर्जी लोन ऐप, न्यूड फोटो लीक करने की धमकी या ऑनलाइन ठगी गंभीर अपराध है। तुरंत 1930 पर फोन करके पैसे और फोटो ब्लॉक करवाएं।',
    voiceScriptEn: 'Alert for men, boys, and women. If someone blackmails you with a recorded video call, threatens to send sensitive photos to your contacts, or threatens you through illegal loan apps, do not pay money out of shame. The Ministry of Home Affairs Cyber Desk provides full privacy. Call 1930 immediately.',
    voiceScriptHi: 'यह कानून पुरुषों और महिलाओं दोनों के लिए बहुत जरूरी है। अगर कोई आपको वीडियो कॉल, फर्जी फोटो या लोन ऐप के जरिए ब्लैकमेल करे और पैसे मांगे, तो शर्म के मारे डरिए मत। तुरंत 1930 डायल करें। सरकार आपकी पहचान गुप्त रखकर ब्लैकमेलर के बैंक खाते और लिंक सीज करती है।',
    actionPointsEn: [
      'Never transfer money to blackmailers — payments only increase extortion demands.',
      'Take screenshots of chat history, caller phone numbers, and UPI transaction IDs.',
      'Report on cybercrime.gov.in or dial 1930 within the golden hour to freeze fraudulent bank transfers.',
      'Section 66E & 67 of the IT Act penalizes privacy violation and obscene extortion with up to 5 years imprisonment.'
    ],
    actionPointsHi: [
      'ब्लैकमेलर को कभी पैसे न दें — पैसे देने से वे बार-बार ब्लैकमेल करते हैं।',
      'कॉल, चैट, फोन नंबर और बैंक लेन-देन के स्क्रीनशॉट सुरक्षित रखें।',
      'तुरंत 1930 पर कॉल करें या cybercrime.gov.in पर बिना थाने जाए ऑनलाइन शिकायत करें।',
      'आईटी एक्ट की धारा 66E व 67 के तहत ब्लैकमेलर को 5 साल तक की सख्त जेल हो सकती है।'
    ],
    helplineNumber: '1930',
    helplineLabel: 'Cybercrime Helpline: 1930',
  },
  {
    id: 'right_good_samaritan_road',
    iconName: 'HeartPulse',
    badge: 'Men & Women • Medical Law',
    targetAudience: 'all',
    titleEn: 'Good Samaritan Protection: Help Accident Victims Without Police Trouble',
    titleHi: 'गुड सेमेरिटन कानून — सड़क हादसे में मदद करने वाले को पुलिस परेशान नहीं कर सकती',
    plainSummaryEn: 'Anyone rushing an injured person to hospital cannot be detained, questioned, or forced to pay medical fees.',
    plainSummaryHi: 'सड़क पर घायल व्यक्ति को अस्पताल पहुंचाने वाले नागरिक को पुलिस या डॉक्टर रोक नहीं सकते, न ही केस में गवाह बनने का दबाव डाल सकते हैं।',
    voiceScriptEn: 'Supreme Court law for all citizens. If you see someone injured on the road and take them to a hospital, you are legally a Good Samaritan. Doctors and police cannot ask for your name, detain you, or ask you to pay treatment costs. Your only duty was humanity.',
    voiceScriptHi: 'सुप्रीम कोर्ट का महत्वपूर्ण फैसला सुनिए। अगर आप सड़क पर किसी घायल या बेहोश इंसान को अस्पताल ले जाते हैं, तो पुलिस या अस्पताल आपको रोक नहीं सकता। आपको अपना नाम या पता बताने की कोई मजबूरी नहीं है और न ही आपसे इलाज के पैसे मांगे जा सकते हैं।',
    actionPointsEn: [
      'No hospital can refuse immediate trauma stabilization to an emergency patient.',
      'Helpers cannot be coerced to reveal their identity or become court witnesses.',
      'The government awards up to ₹5,000 cash and certification for life-saving Good Samaritans.'
    ],
    actionPointsHi: [
      'कोई भी अस्पताल सड़क हादसे के घायल को इमरजेंसी इलाज देने से मना नहीं कर सकता।',
      'मददगार नागरिक से पुलिस थाने में बार-बार पूछताछ नहीं कर सकती।',
      'जान बचाने वाले नागरिकों को सरकार की तरफ से ₹5,000 का नकद इनाम व सम्मान दिया जाता है।'
    ],
    helplineNumber: '108',
    helplineLabel: 'Emergency Ambulance: 108',
  },
  {
    id: 'right_tele_manas_mental',
    iconName: 'HeartPulse',
    badge: 'Men & Women • Mental Health',
    targetAudience: 'all',
    titleEn: 'Right to Free 24/7 Mental Health Care & Depression Counseling',
    titleHi: 'मुफ़्त मानसिक स्वास्थ्य व डिप्रेशन काउंसलिंग का कानूनी अधिकार',
    plainSummaryEn: 'Men and women suffering from depression, acute stress, or suicidal thoughts have 24/7 free access to clinical psychologists.',
    plainSummaryHi: 'तनाव, अवसाद, डिप्रेशन या आत्महत्या के विचारों से जूझ रहे किसी भी पुरुष या महिला को सरकार 24 घंटे मुफ़्त टेली-काउंसलिंग प्रदान करती है।',
    voiceScriptEn: 'Attention brothers and sisters. If you are going through severe emotional stress, work burnout, loneliness, or depression, you do not have to fight it alone. Under the Mental Healthcare Act, the Government of India provides 24/7 confidential counseling by clinical doctors in your own language. Dial 14416.',
    voiceScriptHi: 'भाई और बहनों, अगर आप गंभीर तनाव, नौकरी के दबाव, डिप्रेशन या बेचैनी से जूझ रहे हैं, तो अकेले मत घुटिए। भारत सरकार के राष्ट्रीय टेली-मानस कार्यक्रम के तहत 14416 पर 24 घंटे मुफ़्त और पूरी तरह गोपनीय मनोवैज्ञानिक डॉक्टर से बात करें। यह सेवा पूरी तरह मुफ़्त है।',
    actionPointsEn: [
      'Mental Healthcare Act 2017 guarantees access to free psychiatric services.',
      'Conversations are completely confidential and multilingual.',
      'Available 24 hours a day, 365 days a year across all Indian states.'
    ],
    actionPointsHi: [
      'मानसिक स्वास्थ्य देखभाल अधिनियम 2017 के तहत मुफ़्त इलाज पाना आपका अधिकार है।',
      'आपकी पहचान और बातचीत 100% गोपनीय रखी जाती है।',
      'टोल-फ्री नंबर 14416 पर किसी भी समय अपनी भाषा में डॉक्टर से बात करें।'
    ],
    helplineNumber: '14416',
    helplineLabel: 'Tele-MANAS Counseling: 14416',
  },

  // --- SPECIAL WOMEN'S PROTECTIONS ---
  {
    id: 'right_night_arrest',
    iconName: 'Moon',
    badge: 'Women Protection • Police Rule',
    targetAudience: 'women',
    titleEn: 'No Police Station Visit Between Sunset & Sunrise for Women',
    titleHi: 'सूर्यास्त के बाद रात में महिलाओं को थाने नहीं बुलाया जा सकता',
    plainSummaryEn: 'Police cannot arrest or summon a woman to a police station after dark. Questioning must happen at home with female officers.',
    plainSummaryHi: 'शाम ढलने के बाद और सुबह होने से पहले पुलिस किसी भी महिला को थाने नहीं ले जा सकती। पूछताछ सिर्फ आपके घर पर महिला पुलिसकर्मी की मौजूदगी में होगी।',
    voiceScriptEn: 'Attention sister. By law, police officers cannot take any woman to the police station after sunset. If police need to ask you questions, a female officer must come to your home in front of your family members.',
    voiceScriptHi: 'बहन ध्यान से सुनें। कानून के अनुसार शाम होने के बाद पुलिस आपको कभी भी थाने नहीं ले जा सकती। अगर कोई पूछताछ करनी है, तो महिला पुलिसकर्मी को आपके घर आना होगा और आपके परिवार के सामने ही बात करनी होगी।',
    actionPointsEn: [
      'Women have the legal right to refuse to go to any police station after sunset.',
      'Only a female police officer can question, search, or touch a woman.',
      'Statements must be taken in the presence of parents, spouse, or lawyer at home.'
    ],
    actionPointsHi: [
      'शाम के बाद थाने जाने से महिलाएं सीधे मना कर सकती हैं, यह कानूनी अधिकार है।',
      'सिर्फ महिला पुलिस अधिकारी ही महिला से बात या जांच कर सकती है।',
      'पूछताछ केवल आपके घर पर परिवार वालों के सामने होगी।'
    ],
    helplineNumber: '112',
    helplineLabel: 'Emergency Police: 112',
  },
  {
    id: 'right_zero_fir',
    iconName: 'FileText',
    badge: 'All Citizens • Reporting Rule',
    targetAudience: 'all',
    titleEn: 'Zero FIR: Any Police Station MUST Write Your Complaint',
    titleHi: 'शून्य एफआईआर: कोई भी थाना शिकायत लिखने से मना नहीं कर सकता',
    plainSummaryEn: 'No officer can say "This is not our jurisdiction". Any police station must register the report immediately.',
    plainSummaryHi: 'कोई भी पुलिसवाला यह कहकर आपको भगा नहीं सकता कि "यह इलाका हमारा नहीं है"। घटना कहीं भी हुई हो, किसी भी थाने में तुरंत शिकायत दर्ज होगी।',
    voiceScriptEn: 'Listen carefully. If a crime or accident happens anywhere, you can walk into the nearest police station. The officer cannot turn you away or say go to another jurisdiction. By Supreme Court order, they must write a Zero FIR immediately.',
    voiceScriptHi: 'सुनिए, अगर आपके साथ कोई घटना, लूट या हमला हुआ है, तो आप पास के किसी भी थाने में जा सकते हैं। पुलिस अफसर यह नहीं कह सकता कि दूसरे थाने जाओ। उन्हें तुरंत जीरो एफआईआर लिखनी ही होगी, वरना उनकी नौकरी पर बात आएगी।',
    actionPointsEn: [
      'The police station cannot turn away any citizen under jurisdictional excuses.',
      'If an officer refuses to file an FIR, they can be imprisoned for up to 2 years under law.',
      'Every citizen is entitled to a free printed copy of the signed FIR immediately.'
    ],
    actionPointsHi: [
      'थानेदार इलाका न होने का बहाना बनाकर आपको दूसरे थाने नहीं भेज सकता।',
      'अगर कोई पुलिसकर्मी रिपोर्ट दर्ज करने से मना करे, तो उसे 2 साल तक की जेल हो सकती है।',
      'एफआईआर दर्ज होने के बाद उसकी एक मुफ़्त कॉपी पाना आपका कानूनी हक है।'
    ],
    helplineNumber: '112',
    helplineLabel: 'Police Emergency: 112',
  },
  {
    id: 'right_free_lawyer',
    iconName: 'Scale',
    badge: 'Men & Women • Free Justice',
    targetAudience: 'all',
    titleEn: '100% Free Government Lawyer (No Money Needed)',
    titleHi: 'मुफ़्त सरकारी वकील — एक रुपया भी नहीं लगेगा (नालसा)',
    plainSummaryEn: 'All women, children, custody undertrials, and citizens unable to afford an advocate are legally entitled to free legal aid.',
    plainSummaryHi: 'अदालत में केस लड़ने के लिए सभी महिलाओं, बच्चों और आर्थिक रूप से कमजोर पुरुषों को मुफ़्त सरकारी वकील पाने का संवैधानिक अधिकार है।',
    voiceScriptEn: 'If you have no money to hire a private lawyer, do not worry. Under the Legal Services Authority Act, every woman and every citizen below income thresholds gets a free government lawyer. The lawyer will fight your case for free in court. Dial 15100.',
    voiceScriptHi: 'अगर आपके पास वकील की फीस देने के पैसे नहीं हैं, तो घबराइए मत। सरकार सभी महिलाओं और जरूरतमंद पुरुषों को मुफ़्त में वकील देती है। अदालत का सारा खर्च सरकार उठाती है। टोल-फ्री नंबर 15100 पर फोन करें।',
    actionPointsEn: [
      'Section 12 of LSA Act provides free legal representation to women and underprivileged citizens.',
      'Government covers all filing, notary, and court fees.',
      'Call National Legal Services Authority toll-free on 15100.'
    ],
    actionPointsHi: [
      'कानूनी सेवा प्राधिकरण अधिनियम की धारा 12 के तहत मुफ़्त सरकारी वकील पाने का हक है।',
      'कोर्ट का खर्च, अर्जी और वकील की फीस सब सरकार वहन करती है।',
      'मुफ़्त सरकारी वकील के लिए टोल-फ्री नंबर 15100 पर कॉल करें।'
    ],
    helplineNumber: '15100',
    helplineLabel: 'NALSA Free Legal Aid: 15100',
  },
  {
    id: 'right_residence_domestic',
    iconName: 'Home',
    badge: 'Women Protection • Home Rights',
    targetAudience: 'women',
    titleEn: 'Nobody Can Throw You Out of Your House (Right to Reside)',
    titleHi: 'ससुराल या साझे घर से कोई आपको बाहर नहीं निकाल सकता',
    plainSummaryEn: 'Husband or in-laws cannot lock a woman out. The Domestic Violence Act protects your residence.',
    plainSummaryHi: 'पति या ससुराल वाले किसी महिला को घर से बेदखल नहीं कर सकते। घरेलू हिंसा कानून के तहत उसी घर में सुरक्षित रहने का पूरा हक है।',
    voiceScriptEn: 'Important law for women at home. Relatives cannot throw you out on the street. Even if the house belongs to in-laws, the law strictly gives you the right to live safely in the shared household.',
    voiceScriptHi: 'बहन यह बहुत जरूरी कानून है। पति या ससुराल वाले आपको घर से बाहर नहीं निकाल सकते। भले ही मकान ससुर या पति के नाम हो, कानून आपको उसी घर में सम्मान से रहने का पूरा अधिकार देता है।',
    actionPointsEn: [
      'It is illegal for anyone to throw a woman or children out of the shared household.',
      'Magistrate can order monthly maintenance and child education expenses.',
      'Protection Officers in every district provide immediate shelter and safety.'
    ],
    actionPointsHi: [
      'महिला या बच्चों को घर से बेदखल करना कानूनन जुर्म है।',
      'कोर्ट पति को हर महीने खर्च और भरण-पोषण देने का आदेश दे सकती है।',
      'हर जिले में महिला संरक्षण अधिकारी मौजूद हैं जो आपकी मदद करेंगे।'
    ],
    helplineNumber: '181',
    helplineLabel: 'Women in Distress: 181',
  },
  {
    id: 'right_workplace_safety',
    iconName: 'Briefcase',
    badge: 'Workplace Rule',
    targetAudience: 'women',
    titleEn: 'Safe Workplace & Anti-Harassment (POSH Act)',
    titleHi: 'काम करने की जगह पर छेड़छाड़ के खिलाफ कड़ा कानून (POSH)',
    plainSummaryEn: 'Workplaces must protect female employees from unwanted touch, sexual remarks, or threats to employment.',
    plainSummaryHi: 'दुकान, फैक्ट्री, अस्पताल या दफ्तर — कहीं भी काम करने वाली महिला से अश्लील बातें, गलत हरकत या धमकी देना गंभीर अपराध है।',
    voiceScriptEn: 'Whether you work in an office, small shop, or domestic household, nobody has the right to touch you inappropriately, pass vulgar comments, or threaten your job. You can report them safely.',
    voiceScriptHi: 'चाहे आप दफ्तर में काम करती हों, दुकान में, या किसी भी कार्यस्थल पर — कोई भी आपके साथ गंदी बातें, गलत छूना या नौकरी से निकालने की धमकी नहीं दे सकता। कानून आपकी पूरी सुरक्षा करेगा।',
    actionPointsEn: [
      'Unwanted physical touch, sexual remarks, or showing vulgar photos is punishable by law.',
      'Employees cannot be fired or penalized for speaking up against harassment.',
      'Complaints can be filed with the Internal Complaints Committee (ICC) or on shebox.wcd.gov.in.'
    ],
    actionPointsHi: [
      'गलत तरीके से छूना, अश्लील बातें करना या तस्वीरें दिखाना कानूनन जुर्म है।',
      'शिकायत करने पर कोई आपको नौकरी से नहीं निकाल सकता।',
      'दफ्तर की आंतरिक समिति या शी-बॉक्स पोर्टल पर सीधे शिकायत दर्ज की जा सकती है।'
    ],
    helplineNumber: '1091',
    helplineLabel: 'Women Harassment Desk: 1091',
  },
];

// Backward compatibility alias
export const SIMPLIFIED_WOMEN_RIGHTS = SIMPLIFIED_LEGAL_RIGHTS;
