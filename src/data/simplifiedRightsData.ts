export interface SimplifiedLawRight {
  id: string;
  iconName: string;
  badge: string;
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

export const SIMPLIFIED_WOMEN_RIGHTS: SimplifiedLawRight[] = [
  {
    id: 'right_night_arrest',
    iconName: 'Moon',
    badge: 'Police Rule',
    titleEn: 'No Police Station Visit Between Sunset & Sunrise',
    titleHi: 'सूर्यास्त के बाद रात में थाने नहीं बुलाया जा सकता',
    plainSummaryEn: 'Police cannot arrest or summon a woman to a police station after dark. Questioning must happen at your home.',
    plainSummaryHi: 'शाम ढलने के बाद और सुबह होने से पहले पुलिस किसी भी महिला को थाने नहीं ले जा सकती। पूछताछ सिर्फ आपके घर पर महिला पुलिसकर्मी की मौजूदगी में होगी।',
    voiceScriptEn: 'Attention sister. By law, police officers cannot take any woman to the police station after sunset. If police need to ask you questions, a female officer must come to your home in front of your family members.',
    voiceScriptHi: 'बहन ध्यान से सुनें। कानून के अनुसार शाम होने के बाद पुलिस आपको कभी भी थाने नहीं ले जा सकती। अगर कोई पूछताछ करनी है, तो महिला पुलिसकर्मी को आपके घर आना होगा और आपके परिवार के सामने ही बात करनी होगी।',
    actionPointsEn: [
      'You have the legal right to refuse to go to any police station after sunset.',
      'Only a female police officer can question or touch a woman.',
      'Statements must be taken in the presence of your parents, spouse, or lawyer at your home.'
    ],
    actionPointsHi: [
      'शाम के बाद थाने जाने से आप सीधे मना कर सकती हैं, यह आपका कानूनी अधिकार है।',
      'सिर्फ महिला पुलिस अधिकारी ही आपसे बात या जांच कर सकती है।',
      'पूछताछ केवल आपके घर पर परिवार वालों के सामने होगी।'
    ],
    helplineNumber: '112',
    helplineLabel: 'Emergency Police: 112',
  },
  {
    id: 'right_zero_fir',
    iconName: 'FileText',
    badge: 'Reporting Rule',
    titleEn: 'Zero FIR: Any Police Station MUST Write Your Complaint',
    titleHi: 'शून्य एफआईआर: कोई भी थाना शिकायत लिखने से मना नहीं कर सकता',
    plainSummaryEn: 'No officer can say "This is not our jurisdiction". Any police station must register your report immediately.',
    plainSummaryHi: 'कोई भी पुलिसवाला यह कहकर आपको भगा नहीं सकता कि "यह इलाका हमारा नहीं है"। घटना कहीं भी हुई हो, किसी भी थाने में तुरंत शिकायत दर्ज होगी।',
    voiceScriptEn: 'Listen carefully. If anyone misbehaves with you, you can walk into the nearest police station. The officer cannot turn you away or say go to another station. By Supreme Court order, they must write a Zero FIR immediately.',
    voiceScriptHi: 'सुनिए बहन। अगर आपके साथ कोई घटना या छेड़छाड़ हुई है, तो आप पास के किसी भी थाने में जा सकती हैं। पुलिस अफसर यह नहीं कह सकता कि दूसरे थाने जाओ। उन्हें तुरंत जीरो एफआईआर लिखनी ही होगी, वरना उनकी नौकरी पर बात आएगी।',
    actionPointsEn: [
      'The police station cannot turn you away under any excuse.',
      'If an officer refuses to file your FIR, they can be imprisoned for up to 2 years under law.',
      'You are entitled to a free printed copy of the signed FIR immediately.'
    ],
    actionPointsHi: [
      'थानेदार बहाना बनाकर आपको दूसरे थाने नहीं भेज सकता।',
      'अगर कोई पुलिसकर्मी रिपोर्ट दर्ज करने से मना करे, तो उसे 2 साल तक की जेल हो सकती है।',
      'एफआईआर दर्ज होने के बाद उसकी एक मुफ़्त कॉपी पाना आपका कानूनी हक है।'
    ],
    helplineNumber: '1091',
    helplineLabel: 'Women Helpline: 1091',
  },
  {
    id: 'right_free_lawyer',
    iconName: 'Scale',
    badge: 'Free Justice',
    titleEn: '100% Free Government Lawyer (No Money Needed)',
    titleHi: 'मुफ़्त सरकारी वकील — एक रुपया भी नहीं लगेगा',
    plainSummaryEn: 'Every woman has the right to a free advocate provided by the government to fight her case in court.',
    plainSummaryHi: 'अदालत में केस लड़ने के लिए हर महिला को मुफ़्त सरकारी वकील पाने का अधिकार है। फीस और कागजात का पूरा खर्च सरकार उठाती है।',
    voiceScriptEn: 'If you have no money to hire a private lawyer, do not worry. Under the Legal Services Authority, every woman gets a free government lawyer. The lawyer will fight your case for free in court. Dial 15100.',
    voiceScriptHi: 'अगर आपके पास वकील की फीस देने के पैसे नहीं हैं, तो बिल्कुल मत घबराइए। सरकार हर महिला को मुफ़्त में वकील देती है। अदालत का सारा खर्च सरकार उठाती है। टोल-फ्री नंबर 15100 पर तुरंत फोन करें।',
    actionPointsEn: [
      'Every woman, rich or poor, educated or uneducated, is legally entitled to free legal aid.',
      'The government covers all filing, notary, and court fees.',
      'Call National Legal Services Authority toll-free on 15100.'
    ],
    actionPointsHi: [
      'अमीर हो या गरीब, हर महिला को मुफ़्त कानूनी सहायता पाने का कानूनी अधिकार है।',
      'कोर्ट का खर्च, अर्जी और वकील की फीस सब सरकार देती है।',
      'मुफ़्त सरकारी वकील के लिए टोल-फ्री नंबर 15100 पर कॉल करें।'
    ],
    helplineNumber: '15100',
    helplineLabel: 'NALSA Free Legal Aid: 15100',
  },
  {
    id: 'right_residence_domestic',
    iconName: 'Home',
    badge: 'Home Protection',
    titleEn: 'Nobody Can Throw You Out of Your House (Right to Reside)',
    titleHi: 'ससुराल या साझे घर से कोई आपको बाहर नहीं निकाल सकता',
    plainSummaryEn: 'Husband or in-laws cannot lock you out or throw your belongings out. The Domestic Violence Act protects your home.',
    plainSummaryHi: 'पति या ससुराल वाले आपको घर से बेदखल नहीं कर सकते। चाहे घर आपके नाम न हो, घरेलू हिंसा कानून के तहत आपको उसी घर में सुरक्षित रहने का पूरा हक है।',
    voiceScriptEn: 'Important law for sisters at home. Your husband or relatives cannot throw you out on the street. Even if the house belongs to your father-in-law, the law strictly gives you the right to live safely in the shared household.',
    voiceScriptHi: 'बहन यह बहुत जरूरी कानून है। पति या ससुराल वाले आपको घर से बाहर नहीं निकाल सकते। भले ही मकान ससुर या पति के नाम हो, कानून आपको उसी घर की छत के नीचे सम्मान से रहने का पूरा अधिकार देता है। हेल्पलाइन 181 पर कॉल करें।',
    actionPointsEn: [
      'It is illegal for anyone to throw you or your children out of the shared household.',
      'The magistrate can order your husband to pay monthly maintenance and child expenses.',
      'Protection Officers are available in every district to provide immediate shelter and safety.'
    ],
    actionPointsHi: [
      'आपको या आपके बच्चों को घर से बाहर निकालना गैरकानूनी जुर्म है।',
      'कोर्ट पति को हर महीने आपके और बच्चों के खर्चे के पैसे देने का आदेश दे सकती है।',
      'हर जिले में महिला संरक्षण अधिकारी मौजूद हैं जो आपकी मदद करेंगे।'
    ],
    helplineNumber: '181',
    helplineLabel: 'Women in Distress: 181',
  },
  {
    id: 'right_free_medical',
    iconName: 'HeartPulse',
    badge: 'Medical Care',
    titleEn: 'Free Emergency Treatment at ANY Hospital',
    titleHi: 'किसी भी अस्पताल में मुफ़्त इमरजेंसी इलाज का अधिकार',
    plainSummaryEn: 'All government and private hospitals must treat any woman facing violence immediately without demanding money or police forms.',
    plainSummaryHi: 'किसी भी मारपीट या हमले के बाद, सभी सरकारी और प्राइवेट अस्पताल आपका तुरंत मुफ़्त इलाज करने के लिए कानूनन बाध्य हैं। कोई पैसे या एफआईआर का बहाना नहीं बना सकता।',
    voiceScriptEn: 'If you are hurt or attacked, go to the nearest hospital immediately. Both private and government hospitals must give you free first aid and medical care. They cannot wait for police or ask for money first.',
    voiceScriptHi: 'अगर चोट लगी है या कोई हमला हुआ है, तो तुरंत पास के अस्पताल जाएं। चाहे सरकारी अस्पताल हो या बड़ा प्राइवेट अस्पताल, उन्हें मुफ़्त इलाज करना ही होगा। वे पहले पैसे या पुलिस रिपोर्ट का इंतजार नहीं कर सकते।',
    actionPointsEn: [
      'Hospitals cannot turn you away or delay treatment waiting for police.',
      'Medical examination, treatment, and basic medicines are 100% free by law.',
      'Hospital must issue a confidential medical report for your legal protection.'
    ],
    actionPointsHi: [
      'अस्पताल इलाज में देरी नहीं कर सकता और न ही पुलिस का इंतजार कर सकता है।',
      'प्राथमिक उपचार और दवाएं पूरी तरह मुफ़्त मिलनी अनिवार्य हैं।',
      'अस्पताल आपको एक मेडिकल रिपोर्ट देगा जो कोर्ट में सबूत बनेगी।'
    ],
    helplineNumber: '108',
    helplineLabel: 'Ambulance / Emergency: 108',
  },
  {
    id: 'right_workplace_safety',
    iconName: 'Briefcase',
    badge: 'Workplace Rule',
    titleEn: 'Safe Workplace & Anti-Harassment (POSH Law)',
    titleHi: 'काम करने की जगह पर छेड़छाड़ के खिलाफ कड़ा कानून',
    plainSummaryEn: 'Every workplace (office, factory, hospital, domestic work) must protect women from bad touch, comments, or threats.',
    plainSummaryHi: 'फैक्ट्री, दुकान, अस्पताल, घर या दफ्तर — कहीं भी काम करने वाली महिला से अश्लील बातें, गलत हरकत या धमकी देना गंभीर अपराध है।',
    voiceScriptEn: 'Sister, whether you work in an office, a small shop, or as a domestic worker, nobody has the right to touch you inappropriately, pass dirty comments, or threaten your job. You can report them safely.',
    voiceScriptHi: 'बहन, चाहे आप दफ्तर में काम करती हों, दुकान में, या घरों में काम करती हों — कोई भी आपके साथ गंदी बातें, गलत छूना या नौकरी से निकालने की धमकी नहीं दे सकता। कानून आपकी पूरी सुरक्षा करेगा।',
    actionPointsEn: [
      'Unwanted physical touch, sexual remarks, or showing vulgar photos is punishable by law.',
      'You cannot be fired or punished for speaking up against harassment.',
      'Complaints can be filed with the Internal Committee or Local District Officer.'
    ],
    actionPointsHi: [
      'गलत तरीके से छूना, अश्लील बातें करना या तस्वीरें दिखाना कानूनन जुर्म है।',
      'शिकायत करने पर कोई आपको नौकरी से नहीं निकाल सकता।',
      'हर जिले में महिला शिकायत समिति होती है जो सीधे कार्रवाई करती है।'
    ],
    helplineNumber: '1091',
    helplineLabel: 'Women Harassment Desk: 1091',
  },
];
