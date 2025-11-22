// Language translations object
const translations = {
    en: {
        logo: "VACCINE TRACK",
        home: "Home",
        about_us: "About Us",
        vaccines: "Vaccines",
        contact: "Contact",
        faq: "FAQ",
        login: "Login",
        sign_up: "Sign Up",
        hero_title: "Secure Your Child's Future",
        hero_subtitle: "Track vaccinations, schedule appointments, and manage health records easily.",
        get_started: "Get Started",
        already_member: "Already a Member?",
        about_title: "About the System",
        about_subtitle: "Empowering parents and doctors with a seamless vaccination tracking solution.",
        about_p1: "The Child Vaccination System is a digital platform designed to simplify the complex process of child immunization. We provide a secure, centralized hub where parents can track their child's vaccination history, view upcoming schedules, and receive timely reminders.",
        about_p2: "For healthcare professionals, our system offers a robust tool to manage parent records, update vaccination statuses, and communicate effectively with parents. Our goal is to ensure every child receives their vaccinations on time, contributing to a healthier community.",
        about_li1: "Real-time vaccination records",
        about_li2: "Personalized schedules and reminders",
        about_li3: "Secure data storage and privacy",
        about_li4: "Efficient parent management for doctors",
        vaccines_title: "Common Child Vaccines",
        vaccines_subtitle: "An overview of essential vaccines for children aged 1 to 10.",
        mmr_name: "MMR (Measles, Mumps, Rubella)",
        mmr_desc: "A combination vaccine that protects against measles, mumps, and rubella. These are highly contagious diseases that can lead to serious health complications.",
        mmr_age: "The second dose is typically needed between the ages of 4 and 6 years.",
        varicella_name: "Varicella (Chickenpox)",
        varicella_desc: "This vaccine prevents chickenpox, a common childhood illness that can cause a blistering rash, itching, and fever.",
        varicella_age: "The second dose is typically needed between the ages of 4 and 6 years.",
        dtap_name: "DTaP (Diphtheria, Tetanus, Pertussis)",
        dtap_desc: "A combination vaccine that protects against three life-threatening diseases. Diphtheria can cause breathing problems, Tetanus can lead to muscle spasms, and Pertussis (whooping cough) can cause uncontrollable, violent coughing.",
        dtap_age: "Booster shots are typically needed between the ages of 4 and 6 years.",
        polio_name: "Polio (IPV)",
        polio_desc: "The polio vaccine protects against poliomyelitis, a disabling and life-threatening disease caused by the poliovirus.",
        polio_age: "The final booster dose is typically given between the ages of 4 and 6 years.",
        hepa_name: "Hepatitis A",
        hepa_desc: "This vaccine protects against the Hepatitis A virus, which can cause severe liver disease. It is often recommended for children in high-risk areas.",
        hepa_age: "The second dose of this vaccine is typically given at least 6 months after the first, usually between ages 2 and 3.",
        meningococcal_name: "Meningococcal",
        meningococcal_desc: "This vaccine protects against serious bacterial infections that can cause meningitis (inflammation of the brain and spinal cord) and other life-threatening conditions.",
        meningococcal_age: "The vaccine is often given to older children, with the first dose typically recommended at age 11 or 12.",
        pcv_name: "Pneumococcal (PCV)",
        pcv_desc: "This vaccine protects against pneumococcal disease, a leading cause of ear infections, pneumonia, and serious illnesses like meningitis and bacteremia.",
        pcv_age: "A booster dose is needed between 12 and 15 months.",
        influenza_name: "Influenza (Flu)",
        influenza_desc: "The flu vaccine protects against the influenza virus, which can cause severe respiratory illness, especially in young children.",
        influenza_age: "This vaccine is recommended annually for children 6 months and older.",
        hepb_name: "Hepatitis B (HepB)",
        hepb_desc: "A vaccine that protects against the Hepatitis B virus, which can cause severe liver disease.",
        hepb_age: "The full series consists of multiple doses, with the last one often given between 6 and 18 months of age.",
        contact_title: "Contact Us",
        contact_subtitle: "Have questions? We're here to help.",
        name_label: "Name",
        email_label: "Email",
        message_label: "Message",
        send_message: "Send Message",
        faq_title: "Frequently Asked Questions",
        faq_subtitle: "Answers to your most common questions.",
        faq1_q: "How do I register my child?",
        faq1_a: "You can register your child by creating a parent account, logging in, and then adding your child's details to your profile. You will need their birth date and other relevant information.",
        faq2_q: "Is my data secure?",
        faq2_a: "Yes, we use industry-standard encryption and security protocols to ensure your data is safe and private. Only authorized users (you and your child's registered doctor) can access the information.",
        faq3_q: "Can I view my child's vaccination history?",
        faq3_a: "Absolutely. Once a doctor updates a vaccination record, it will be immediately visible in your child's profile under your account. You can also download a copy for your records.",
        footer_text: "© 2024 Child Vaccination System. All rights reserved.",
        modal_login_title: "Login",
        modal_login_subtitle: "Are you a Parent or a Doctor?",
        patient_login: "Parent Login",
        doctor_login: "Doctor Login",
        modal_signup_title: "Sign Up",
        modal_signup_subtitle: "Are you a Parent or a Doctor?",
        patient_signup: "Parent Sign Up",
        doctor_signup: "Doctor Sign Up",
    },
    hi: {
        logo: "वैक्सीन ट्रैक",
        home: "होम",
        about_us: "हमारे बारे में",
        vaccines: "टीके",
        contact: "संपर्क करें",
        faq: "अक्सर पूछे जाने वाले प्रश्न",
        login: "लॉग इन",
        sign_up: "साइन अप",
        hero_title: "अपने बच्चे के भविष्य को सुरक्षित करें",
        hero_subtitle: "आसानी से टीकाकरण, अपॉइंटमेंट और स्वास्थ्य रिकॉर्ड प्रबंधित करें।",
        get_started: "शुरू करें",
        already_member: "पहले से ही सदस्य हैं?",
        about_title: "सिस्टम के बारे में",
        about_subtitle: "माता-पिता और डॉक्टरों को एक सहज टीकाकरण ट्रैकिंग समाधान के साथ सशक्त बनाना।",
        about_p1: "बाल टीकाकरण प्रणाली एक डिजिटल प्लेटफॉर्म है जिसे बच्चों के टीकाकरण की जटिल प्रक्रिया को सरल बनाने के लिए डिज़ाइन किया गया है। हम एक सुरक्षित, केंद्रीकृत हब प्रदान करते हैं जहां माता-पिता अपने बच्चे के टीकाकरण इतिहास को ट्रैक कर सकते हैं, आने वाले शेड्यूल देख सकते हैं, और समय पर अनुस्मारक प्राप्त कर सकते हैं।",
        about_p2: "स्वास्थ्य पेशेवरों के लिए, हमारा सिस्टम रोगी रिकॉर्ड प्रबंधित करने, टीकाकरण की स्थिति को अपडेट करने और माता-पिता के साथ प्रभावी ढंग से संवाद करने के लिए एक मजबूत उपकरण प्रदान करता है। हमारा लक्ष्य यह सुनिश्चित करना है कि हर बच्चे को समय पर टीके मिलें, जिससे एक स्वस्थ समुदाय में योगदान हो।",
        about_li1: "वास्तविक समय टीकाकरण रिकॉर्ड",
        about_li2: "व्यक्तिगत शेड्यूल और अनुस्मारक",
        about_li3: "सुरक्षित डेटा भंडारण और गोपनीयता",
        about_li4: "डॉक्टरों के लिए कुशल रोगी प्रबंधन",
        vaccines_title: "सामान्य बाल टीके",
        vaccines_subtitle: "1 से 10 वर्ष की आयु के बच्चों के लिए आवश्यक टीकों का एक अवलोकन।",
        mmr_name: "एमएमआर (खसरा, गलसुआ, रूबेला)",
        mmr_desc: "एक संयुक्त टीका जो खसरा, गलसुआ और रूबेला से बचाता है। ये अत्यधिक संक्रामक रोग हैं जो गंभीर स्वास्थ्य जटिलताओं का कारण बन सकते हैं।",
        mmr_age: "दूसरी खुराक आमतौर पर 4 और 6 साल की उम्र के बीच आवश्यक होती है।",
        varicella_name: "वैरिसेला (छोटी माता)",
        varicella_desc: "यह टीका छोटी माता को रोकता है, जो एक सामान्य बचपन की बीमारी है जो एक फफोलेदार चकत्ते, खुजली और बुखार का कारण बन सकती है।",
        varicella_age: "दूसरी खुराक आमतौर पर 4 और 6 साल की उम्र के बीच आवश्यक होती है।",
        dtap_name: "डीटीएपी (डिप्थीरिया, टेटनस, पर्टुसिस)",
        dtap_desc: "एक संयुक्त टीका जो तीन जानलेवा बीमारियों से बचाता है। डिप्थीरिया से सांस लेने में समस्या हो सकती है, टेटनस से मांसपेशियों में ऐंठन हो सकती है, और पर्टुसिस (काली खांसी) से बेकाबू, हिंसक खांसी हो सकती है।",
        dtap_age: "बूस्टर शॉट्स आमतौर पर 4 और 6 साल की उम्र के बीच आवश्यक होते हैं।",
        polio_name: "पोलियो (आईपीवी)",
        polio_desc: "पोलियो टीका पोलियोमाइलाइटिस से बचाता है, जो पोलियोवायरस के कारण होने वाला एक विकलांग और जानलेवा रोग है।",
        polio_age: "अंतिम बूस्टर खुराक आमतौर पर 4 और 6 साल की उम्र के बीच दी जाती है।",
        hepa_name: "हेपेटाइटिस ए",
        hepa_desc: "यह टीका हेपेटाइटिस ए वायरस से बचाता है, जो गंभीर यकृत रोग का कारण बन सकता है। यह अक्सर उच्च जोखिम वाले क्षेत्रों में बच्चों के लिए अनुशंसित है।",
        hepa_age: "इस टीके की दूसरी खुराक आमतौर पर पहली के कम से कम 6 महीने बाद दी जाती है, आमतौर पर 2 और 3 साल की उम्र के बीच।",
        meningococcal_name: "मेनिंगोकोकल",
        meningococcal_desc: "यह टीका गंभीर जीवाणु संक्रमण से बचाता है जो मेनिन्जाइटिस (मस्तिष्क और रीढ़ की हड्डी की सूजन) और अन्य जानलेवा स्थितियों का कारण बन सकता है।",
        meningococcal_age: "यह टीका अक्सर बड़े बच्चों को दिया जाता है, पहली खुराक आमतौर पर 11 या 12 साल की उम्र में अनुशंसित होती है।",
        pcv_name: "न्यूमोकोकल (पीसीवी)",
        pcv_desc: "यह टीका न्यूमोकोकल रोग से बचाता है, जो कान के संक्रमण, निमोनिया और मेनिन्जाइटिस और बैक्टीरिमिया जैसी गंभीर बीमारियों का एक प्रमुख कारण है।",
        pcv_age: "12 और 15 महीनों के बीच एक बूस्टर खुराक की आवश्यकता होती है।",
        influenza_name: "इन्फ्लुएंजा (फ्लू)",
        influenza_desc: "फ्लू का टीका इन्फ्लूएंजा विषाणूपासून संरक्षण करते, जो विशेषतः लहान मुलांमध्ये गंभीर श्वसन रोग होऊ शकतो.",
        influenza_age: "ही लस 6 महिने आणि त्याहून अधिक वयाच्या मुलांसाठी दरवर्षी शिफारसीय आहे.",
        hepb_name: "हेपेटायटिस बी (हेपबी)",
        hepb_desc: "एक लस जी हेपेटायटिस बी विषाणूपासून संरक्षण करते, ज्यामुळे गंभीर यकृत रोग होऊ शकतो.",
        hepb_age: "पूर्ण श्रृंखलेत अनेक मात्रा असतात, ज्यात शेवटची मात्रा 6 ते 18 महिन्यांच्या दरम्यान दिली जाते.",
        contact_title: "संपर्क साधा",
        contact_subtitle: "प्रश्न आहेत? आम्ही मदतीसाठी येथे आहोत.",
        name_label: "नाव",
        email_label: "ईमेल",
        message_label: "संदेश",
        send_message: "संदेश पाठवा",
        faq_title: "वारंवार विचारले जाणारे प्रश्न",
        faq_subtitle: "तुमच्या सर्वात सामान्य प्रश्नांची उत्तरे.",
        faq1_q: "मी माझ्या मुलाची नोंदणी कशी करू?",
        faq1_a: "आपण पालक खाते तयार करून, लॉग इन करून, आणि नंतर आपल्या मुलाचे तपशील आपल्या प्रोफाइलमध्ये जोडून आपल्या मुलाची नोंदणी करू शकता. आपल्याला त्यांची जन्मतारीख आणि इतर संबंधित माहिती लागेल.",
        faq2_q: "माझा डेटा सुरक्षित आहे का?",
        faq2_a: "होय, आम्ही आपला डेटा सुरक्षित आणि खाजगी असल्याची खात्री करण्यासाठी उद्योग-मानक एन्क्रिप्शन आणि सुरक्षा प्रोटोकॉल वापरतो. केवळ अधिकृत वापरकर्ते (आपण आणि आपल्या मुलाचे नोंदणीकृत डॉक्टर) माहितीमध्ये प्रवेश करू शकतात.",
        faq3_q: "मी माझ्या मुलाचा लसीकरण इतिहास पाहू शकतो का?",
        faq3_a: "नक्कीच. एकदा डॉक्टर लसीकरण रेकॉर्ड अद्ययावत केल्यावर, ते आपल्या खात्याखालील आपल्या मुलाच्या प्रोफाइलमध्ये त्वरित दृश्यमान होईल. आपण आपल्या रेकॉर्डसाठी एक प्रत देखील डाउनलोड करू शकता.",
        footer_text: "© 2024 बाल लसीकरण प्रणाली. सर्व हक्क राखीव.",
        modal_login_title: "लॉग इन",
        modal_login_subtitle: "आपण रुग्ण आहात की डॉक्टर?",
        patient_login: "रुग्ण लॉग इन",
        doctor_login: "डॉक्टर लॉग इन",
        modal_signup_title: "साइन अप",
        modal_signup_subtitle: "आपण रुग्ण आहात की डॉक्टर?",
        patient_signup: "रुग्ण साइन अप",
        doctor_signup: "डॉक्टर साइन अप",
    },

    mr: {
        logo: "लस ट्रॅक",
        home: "मुख्यपृष्ठ",
        about_us: "आमच्याबद्दल",
        vaccines: "लसी",
        contact: "संपर्क",
        faq: "वारंवार विचारले जाणारे प्रश्न",
        login: "लॉग इन",
        sign_up: "साइन अप",
        hero_title: "आपल्या मुलाचे भविष्य सुरक्षित करा",
        hero_subtitle: "लसीकरण, अपॉइंटमेंट आणि आरोग्य रेकॉर्ड सहजपणे ट्रॅक करा.",
        get_started: "सुरू करा",
        already_member: "आधीच सदस्य आहात?",
        about_title: "प्रणालीबद्दल",
        about_subtitle: "अविभाज्य लसीकरण ट्रॅकिंग सोल्यूशनसह पालक आणि डॉक्टरांना सशक्त बनवणे.",
        about_p1: "बाल लसीकरण प्रणाली एक डिजिटल प्लॅटफॉर्म आहे जी बाल रोगप्रतिकारशक्तीची जटिल प्रक्रिया सोपी करण्यासाठी डिझाइन केली आहे. आम्ही एक सुरक्षित, केंद्रीकृत हब प्रदान करतो जिथे पालक त्यांच्या मुलाच्या लसीकरणाचा इतिहास ट्रॅक करू शकतात, आगामी वेळापत्रक पाहू शकतात आणि वेळेवर स्मरणपत्रे प्राप्त करू शकतात.",
        about_p2: "आरोग्यसेवा व्यावसायिकांसाठी, आमची प्रणाली रुग्ण रेकॉर्ड व्यवस्थापित करण्यासाठी, लसीकरणाची स्थिती अद्ययावत करण्यासाठी आणि पालकांशी प्रभावीपणे संवाद साधण्यासाठी एक मजबूत साधन प्रदान करते. प्रत्येक मुलाला वेळेवर लसीकरण मिळते याची खात्री करणे हे आमचे ध्येय आहे, ज्यामुळे एक निरोगी समुदायाला हातभार लागतो.",
        about_li1: "वास्तविक-वेळ लसीकरण रेकॉर्ड",
        about_li2: "वैयक्तिकृत वेळापत्रक आणि स्मरणपत्रे",
        about_li3: "सुरक्षित डेटा स्टोरेज आणि गोपनीयता",
        about_li4: "डॉक्टरांसाठी कार्यक्षम रुग्ण व्यवस्थापन",
        vaccines_title: "सामान्य बाल लसी",
        vaccines_subtitle: "1 ते 10 वर्षांच्या मुलांसाठी आवश्यक लसींचे एक विहंगावलोकन.",
        mmr_name: "एमएमआर (गोवर, गालगुंड, रुबेला)",
        mmr_desc: "एक संयोजन लस जी गोवर, गालगुंड आणि रुबेलापासून संरक्षण करते. हे अत्यंत संक्रामक रोग आहेत जे गंभीर आरोग्य समस्यांना कारणीभूत ठरू शकतात.",
        mmr_age: "दुसरी मात्रा साधारणपणे 4 ते 6 वर्षांच्या दरम्यान आवश्यक असते.",
        varicella_name: "वरिसेला (कांजिण्या)",
        varicella_desc: "ही लस कांजिण्यांना प्रतिबंधित करते, एक सामान्य बालरोग आजार ज्यामुळे फोड येणारे पुरळ, खाज आणि ताप येऊ शकतो.",
        varicella_age: "दुसरी मात्रा साधारणपणे 4 ते 6 वर्षांच्या दरम्यान आवश्यक असते.",
        dtap_name: "डीटीएपी (डिप्थीरिया, धनुर्वात, डांग्या खोकला)",
        dtap_desc: "एक संयोजन लस जी तीन जीवघेण्या रोगांपासून संरक्षण करते. डिप्थीरियामुळे श्वास घेण्यास समस्या निर्माण होऊ शकते, धनुर्वातामुळे स्नायूंचे स्पाज्म होऊ शकतात, आणि डांग्या खोकल्यामुळे अनियंत्रित, हिंसक खोकला येऊ शकतो.",
        dtap_age: "बूस्टर शॉट्स साधारणपणे 4 ते 6 वर्षांच्या दरम्यान आवश्यक असतात.",
        polio_name: "पोलिओ (आयपीवी)",
        polio_desc: "पोलिओ लस पोलियोमायलाईटिसपासून संरक्षण करते, जो पोलिओव्हायरसमुळे होणारा एक अक्षम आणि जीवघेणा रोग आहे.",
        polio_age: "अंतिम बूस्टर मात्रा साधारणपणे 4 ते 6 वर्षांच्या दरम्यान दिली जाते.",
        hepa_name: "हेपेटायटिस ए",
        hepa_desc: "ही लस हेपेटायटिस ए विषाणूपासून संरक्षण करते, ज्यामुळे गंभीर यकृत रोग होऊ शकतो. हे सहसा उच्च-जोखीम असलेल्या भागांतील मुलांसाठी शिफारसीय आहे.",
        hepa_age: "या लसीची दुसरी मात्रा साधारणपणे पहिल्या मात्रेच्या कमीत कमी 6 महिन्यांनंतर दिली जाते, सामान्यतः 2 ते 3 वर्षांच्या दरम्यान.",
        meningococcal_name: "मेनिंगोकोकल",
        meningococcal_desc: "ही लस गंभीर जीवाणूजन्य संक्रमणांपासून संरक्षण करते ज्यामुळे मेंदूज्वर (मेंदू आणि मणक्याच्या हाडांची सूज) आणि इतर जीवघेण्या स्थिती येऊ शकतात.",
        meningococcal_age: "ही लस बहुतेकदा मोठ्या मुलांना दिली जाते, पहिली मात्रा साधारणपणे 11 किंवा 12 वर्षांच्या वयात शिफारसीय आहे.",
        pcv_name: "न्यूमोकोकल (पीसीवी)",
        pcv_desc: "ही लस न्यूमोकोकल रोगापासून संरक्षण करते, जो कान संक्रमण, निमोनिया आणि मेनिन्जायटीस आणि बॅक्टेरिमीयासारख्या गंभीर आजारांचे एक प्रमुख कारण आहे.",
        pcv_age: "12 ते 15 महिन्यांच्या दरम्यान बूस्टर मात्रेची आवश्यकता असते.",
        influenza_name: "इन्फ्लूएन्झा (फ्लू)",
        influenza_desc: "फ्लू लस इन्फ्लूएन्झा विषाणूपासून संरक्षण करते, ज्यामुळे विशेषतः लहान मुलांमध्ये गंभीर श्वसन रोग होऊ शकतो.",
        influenza_age: "ही लस 6 महिने आणि त्याहून अधिक वयाच्या मुलांसाठी दरवर्षी शिफारसीय आहे.",
        hepb_name: "हेपेटायटिस बी (हेपबी)",
        hepb_desc: "एक लस जी हेपेटायटिस बी विषाणूपासून संरक्षण करते, ज्यामुळे गंभीर यकृत रोग होऊ शकतो.",
        hepb_age: "पूर्ण श्रृंखलेत अनेक मात्रा असतात, ज्यात शेवटची मात्रा 6 ते 18 महिन्यांच्या दरम्यान दिली जाते.",
        contact_title: "संपर्क साधा",
        contact_subtitle: "प्रश्न आहेत? आम्ही मदतीसाठी येथे आहोत.",
        name_label: "नाव",
        email_label: "ईमेल",
        message_label: "संदेश",
        send_message: "संदेश पाठवा",
        faq_title: "वारंवार विचारले जाणारे प्रश्न",
        faq_subtitle: "तुमच्या सर्वात सामान्य प्रश्नांची उत्तरे.",
        faq1_q: "मी माझ्या मुलाची नोंदणी कशी करू?",
        faq1_a: "आपण पालक खाते तयार करून, लॉग इन करून, आणि नंतर आपल्या मुलाचे तपशील आपल्या प्रोफाइलमध्ये जोडून आपल्या मुलाची नोंदणी करू शकता. आपल्याला त्यांची जन्मतारीख आणि इतर संबंधित माहिती लागेल.",
        faq2_q: "माझा डेटा सुरक्षित आहे का?",
        faq2_a: "होय, आम्ही आपला डेटा सुरक्षित आणि खाजगी असल्याची खात्री करण्यासाठी उद्योग-मानक एन्क्रिप्शन आणि सुरक्षा प्रोटोकॉल वापरतो. केवळ अधिकृत वापरकर्ते (आपण आणि आपल्या मुलाचे नोंदणीकृत डॉक्टर) माहितीमध्ये प्रवेश करू शकतात.",
        faq3_q: "मी माझ्या मुलाचा लसीकरण इतिहास पाहू शकतो का?",
        faq3_a: "नक्कीच. एकदा डॉक्टर लसीकरण रेकॉर्ड अद्ययावत केल्यावर, ते आपल्या खात्याखालील आपल्या मुलाच्या प्रोफाइलमध्ये त्वरित दृश्यमान होईल. आपण आपल्या रेकॉर्डसाठी एक प्रत देखील डाउनलोड करू शकता.",
        footer_text: "© 2024 बाल लसीकरण प्रणाली. सर्व हक्क राखीव.",
        modal_login_title: "लॉग इन",
        modal_login_subtitle: "आपण रुग्ण आहात की डॉक्टर?",
        patient_login: "रुग्ण लॉग इन",
        doctor_login: "डॉक्टर लॉग इन",
        modal_signup_title: "साइन अप",
        modal_signup_subtitle: "आपण रुग्ण आहात की डॉक्टर?",
        patient_signup: "रुग्ण साइन अप",
        doctor_signup: "डॉक्टर साइन अप",
    }

};

// Function to change the language
function changeLanguage(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

// Toggle mobile menu
document.getElementById('mobile-menu-button').addEventListener('click', function () {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

// Toggle FAQ content
function toggleFAQ(element) {
    const content = element.querySelector('.faq-content');
    const icon = element.querySelector('span');
    content.classList.toggle('hidden');
    icon.textContent = content.classList.contains('hidden') ? '+' : '−';
}

// Toggle language menu
document.getElementById('language-menu-button').addEventListener('click', function () {
    const menu = document.getElementById('language-menu');
    menu.classList.toggle('hidden');
});

// Hide language menu when clicking outside
document.addEventListener('click', function (event) {
    const langMenuButton = document.getElementById('language-menu-button');
    const langMenu = document.getElementById('language-menu');
    if (!langMenuButton.contains(event.target) && !langMenu.contains(event.target)) {
        langMenu.classList.add('hidden');
    }
});

// Show a modal
function showModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('flex');
    document.body.style.overflow = 'hidden'; // Disable background scroll
}

// Hide a modal
function hideModal(id) {
    document.getElementById(id).classList.remove('flex');
    document.getElementById(id).classList.add('hidden');
    document.body.style.overflow = 'auto'; // Enable background scroll
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('Vaccine Track System Loaded');
});

// Contact Form Submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });
            const result = await response.json();
            if (result.success) {
                alert(result.message); // Simple alert for success
                contactForm.reset();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            alert(`Error: ${error.message}`); // Simple alert for error
        }
    });
}


