import React, { useState, useEffect } from 'react';
import { Phone, Clock, User, CheckCircle, MapPin, ChevronDown, ChevronUp, Mail, X, Loader2 } from 'lucide-react';
import './App.css';

type Page = 'home' | 'about' | 'schedule' | 'register' | 'faq';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  
  // נתוני טופס הרשמה
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    classType: '' 
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // נתונים דינמיים מגוגל שיטס
  const [faqsList, setFaqsList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // משיכת הנתונים מגוגל שיטס בעליית האתר
  useEffect(() => {
    const fetchData = async () => {
      try {
        // המזהה של הגיליון ששלחת
        const SHEET_ID = '1mcPy9c3mcFlpI_-Igl__fnIeLqdNLfeh3iZLlaGhiek';
        
        // 1. משיכת שאלות נפוצות (FAQ)
        const faqRes = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=FAQ`);
        const faqText = await faqRes.text();
        const faqJson = JSON.parse(faqText.substring(47).slice(0, -2));
        const loadedFaqs = faqJson.table.rows.map((row: any) => ({
          q: row.c[0]?.v || '',
          a: row.c[1]?.v || ''
        })).filter((item: any) => item.q !== ''); // סינון שורות ריקות

        // 2. משיכת שיעורים (Lessons)
        const lessonsRes = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Lessons`);
        const lessonsText = await lessonsRes.text();
        const lessonsJson = JSON.parse(lessonsText.substring(47).slice(0, -2));
        const loadedLessons = lessonsJson.table.rows.map((row: any) => {
          
          // חיתוך שניות מהשעה אם יש (למשל 16:45:00 הופך ל- 16:45)
          const formatTime = (timeStr: string) => {
             if (typeof timeStr === 'string' && timeStr.split(':').length === 3) {
                return timeStr.substring(0, 5);
             }
             return timeStr;
          };

          const startTime = row.c[1]?.f || row.c[1]?.v || '';
          const endTime = row.c[2]?.f || row.c[2]?.v || '';

          return {
            name: row.c[0]?.v || '',
            time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
            day: row.c[3]?.v || '',
            trainer: row.c[4]?.v || '',
            place: row.c[5]?.v || '',
            link: 'https://waze.com/ul' // קבוע כרגע (ניתן להוסיף עמודת קישור בעתיד)
          };
        }).filter((item: any) => item.name !== '');

        setFaqsList(loadedFaqs);
        setLessonsList(loadedLessons);
      } catch (error) {
        console.error('Error fetching data from Google Sheets', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); 
      setIsSubmitting(true);

      try {
        const GOOGLE_SHEET_API_URL = '1mcPy9c3mcFlpI_-Igl__fnIeLqdNLfeh3iZLlaGhiek'; 
        
        if (GOOGLE_SHEET_API_URL == '1mcPy9c3mcFlpI_-Igl__fnIeLqdNLfeh3iZLlaGhiek') {
          await fetch(GOOGLE_SHEET_API_URL, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              data: [
                {
                  'שם מלא': formData.name,
                  'טלפון': formData.phone,
                  'מייל': formData.email,
                  'סוג שיעור': formData.classType
                }
              ]
            })
          });
        }

        // נתוני ההתחברות ל-EmailJS
        const EMAILJS_SERVICE_ID = 'service_3fuopvh';
        const EMAILJS_PUBLIC_KEY = 'PqtnW83lm59F-g6qk';

        // בחירת תבנית המייל לפי סוג השיעור
        let selectedTemplateId = '';
        if (formData.classType === "זומבה קידס ג'וניור") {
          selectedTemplateId = 'template_j6cwj79';
        } else if (formData.classType === "זומבה אימהות ונערות") {
          selectedTemplateId = 'template_xc1mbpd';
        } else {
          // גיבוי למקרה שיש שיעור חדש שנוסף לגוגל שיטס ועדיין אין לו תבנית ספציפית
          selectedTemplateId = 'template_xc1mbpd'; 
        }

        const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: selectedTemplateId,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: {
              to_name: formData.name,
              to_email: formData.email,
              class_type: formData.classType
            }
          })
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          alert('הייתה בעיה בשליחת המייל: ' + errorText);
          setIsSubmitting(false);
          return;
        }

        setIsSuccess(true);
        
      } catch (error) {
        alert('אופס, משהו השתבש. אנא נסו שוב או צרו קשר טלפוני.');
      } finally {
        setIsSubmitting(false);
      }
    };

  const resetForm = () => {
    setIsSuccess(false);
    setFormData({ name: '', phone: '', email: '', classType: '' });
    setCurrentPage('home');
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.innerWidth < 768) {
      window.location.href = 'tel:0505794659';
    } else {
      setIsContactPopupOpen(true);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="flex flex-col md:flex-row items-center justify-between py-12 px-6 max-w-6xl mx-auto gap-8">
            <div className="flex-1 space-y-6 text-right">
              <h1 className="text-5xl md:text-7xl font-black text-[#2E2E2E] leading-tight">
                הגיע הזמן <span className="text-[#E81E76]">לזוז</span>,<br />
                הגיע הזמן <span className="text-[#B7D928]">לזומבה!</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 font-medium">
                הצטרפו לקהילת הזומבה המובילה, שרפו קלוריות עם חיוך והיכנסו לכושר באווירה של מסיבה. מתאים לכל הגילאים ולכל הרמות.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => setCurrentPage('register')}
                  className="bg-[#E81E76] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-[#c91866] transition-colors shadow-lg text-center"
                >
                  הצטרפי עכשיו
                </button>
                <button 
                  onClick={() => setCurrentPage('schedule')}
                  className="bg-[#B7D928] text-[#2E2E2E] px-8 py-3 rounded-full font-bold text-lg hover:bg-[#a3c223] transition-colors shadow-lg text-center"
                >
                  מערכת שעות
                </button>
              </div>
            </div>
            <div className="flex-1 w-full mt-8 md:mt-0">
              <img 
                src="/IMG-20260830-WA0078.jpg" 
                alt="זומבה אנרגיה" 
                className="w-full h-auto rounded-3xl shadow-2xl border-4 border-[#FDE026]"
              />
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="py-12 px-6 max-w-4xl mx-auto">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border-t-8 border-[#B7D928] mb-12">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-[#2E2E2E] mb-4">הולה, איזה כיף שהגעת לכאן!</h2>
                <div className="w-24 h-2 bg-[#E81E76] mx-auto rounded-full"></div>
              </div>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  נעים להכיר, אני <strong>שירן</strong>, מדריכת זומבה ומאמנת סטודיו מוסמכת עם חמש שנות ניסיון בעולם הכושר וההדרכה, ורוקדת זומבה מעל 15 שנים (מכורה אמיתית). 
                </p>
                <p>
                  לפני חמש שנים החלטתי לשנות כיוון ולהפוך את הספורט והתשוקה שלי לדרך חיים אמיתית. בשנה האחרונה העמקתי והשלמתי התמחות מיוחדת בתנועה לגיל הרך ולגיל הזהב.
                </p>
                <p>
                  מעבר לסטודיו, אני מורה ומחנכת, וכך זכיתי לשלב את שתי האהבות הגדולות שלי בחיים: חינוך הדור הצעיר ותנועה בכיף. הזומבה עבורי היא הרבה מעבר לאימון כושר, היא דרך חיים שמשלבת בין פעילות גופנית לבין שחרור, אנרגיות שיא וכיף טהור. עבורי, אימון הוא לא מטלה או עונש, אלא מסיבה אחת גדולה שבה מזיעים, משתחררים ומחייכים.
                </p>
                <p>
                  הזומבה היא חלק בלתי נפרד מהמשפחה שלנו, אפילו לידתה של הלל, הבת שלי, החלה תוך כדי אימון זומבה! היום, הלל כבר בת עשר, אחרי ארבע שנים בהן רקדה היפ הופ, היא מצטרפת אליי לצוות ההדרכה ומלווה את השיעורים שלנו באנרגיות מטורפות!
                </p>
                <p>
                  הסטודיו שלנו הוא בית חם, מקבל ומשפחתי. אנחנו מזמינות ילדים וילדות, נערות ואימהות להצטרף אלינו לשעה של כיף, מלאה בקצב, בשמחה, בחיבור וביחד.
                </p>
                <p className="text-xl font-bold text-[#E81E76] mt-6 text-center">
                  נפגש על הרחבה,<br/>שירן והלל 💛
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <img src="/IMG-20260830-WA0082.jpg" alt="שירן מדריכה" className="w-full h-64 object-cover rounded-2xl shadow-md border-2 border-[#FDE026]" />
                <img src="/IMG-20260830-WA0081.jpg" alt="אימון" className="w-full h-64 object-cover rounded-2xl shadow-md border-2 border-[#E81E76]" />
              </div>
            </div>
            <div className="text-center mt-10">
              <button 
                onClick={() => setCurrentPage('register')}
                className="bg-[#E81E76] text-white px-10 py-4 rounded-full font-bold text-xl hover:bg-[#c91866] transition-colors shadow-xl"
              >
                בואו לנסות - השאירו פרטים
              </button>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="py-12 px-6 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-[#2E2E2E] mb-3">שאלות נפוצות</h2>
              <div className="w-24 h-2 bg-[#FDE026] mx-auto rounded-full"></div>
            </div>
            
            {isLoadingData ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#E81E76]">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="text-xl font-bold">טוען שאלות ותשובות...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqsList.map((faq, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button 
                      onClick={() => toggleFaq(index)}
                      className="w-full flex justify-between items-center p-5 text-right hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                      <span className="font-bold text-[#2E2E2E] text-lg pr-4">{faq.q}</span>
                      <div className="text-[#E81E76] bg-[#E81E76]/10 p-2 rounded-full flex-shrink-0">
                        {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>
                    {openFaq === index && (
                      <div className="p-5 pt-0 text-gray-600 bg-gray-50/50 leading-relaxed border-t border-gray-100 animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'schedule':
        return (
          <div className="py-12 px-6 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-[#2E2E2E] mb-4">מערכת שעות</h2>
              <div className="w-24 h-2 bg-[#B7D928] mx-auto rounded-full"></div>
            </div>
            
            {isLoadingData ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#B7D928]">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="text-xl font-bold text-gray-600">טוען מערכת שעות...</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                {lessonsList.map((cls, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors gap-6 md:gap-0">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="bg-[#FDE026] text-[#2E2E2E] w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold shadow-sm flex-shrink-0">
                        <span>{cls.day}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#2E2E2E]">{cls.name}</h3>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                          <Clock size={16} className="text-[#B7D928]"/>
                          <span dir="ltr">{cls.time}</span>
                        </div>
                        <a href={cls.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 mt-1 hover:text-[#E81E76] transition-colors w-fit">
                          <MapPin size={16} className="text-[#E81E76]"/>
                          <span>{cls.place}</span>
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto gap-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={16} className="text-[#E81E76]"/>
                        <span>{cls.trainer}</span>
                      </div>
                      <button 
                        onClick={() => setCurrentPage('register')}
                        className="bg-[#2E2E2E] text-white px-6 py-2 rounded-full font-semibold hover:bg-black transition-colors"
                      >
                        הרשמה
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'register':
        return (
          <div className="py-12 px-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 w-full bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-[#E81E76] min-h-[450px] flex flex-col justify-center">
              
              {isSuccess ? (
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="w-24 h-24 bg-[#B7D928] text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-[#2E2E2E]">איזה כיף, נרשמת בהצלחה!</h2>
                  <p className="text-lg text-gray-600">
                    הפרטים שלך נקלטו במערכת ומייל תודה נשלח אליך.<br/>
                    ניצור איתך קשר ממש בקרוב לתיאום האימון. מחכים לראותך!
                  </p>
                  <button 
                    onClick={resetForm}
                    className="mt-6 border-2 border-[#E81E76] text-[#E81E76] px-8 py-3 rounded-full font-bold text-lg hover:bg-[#E81E76] hover:text-white transition-colors"
                  >
                    חזרה לדף הבית
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-[#2E2E2E] mb-2">הצטרפו לחגיגה</h2>
                  <p className="text-gray-500 mb-8">השאירו פרטים ונחזור אליכם בהקדם לתיאום אימון ניסיון.</p>
                  
                  <form className="space-y-4 text-right" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">שם מלא</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#E81E76] focus:ring-1 focus:ring-[#E81E76]" 
                        placeholder="שם ומשפחה" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">טלפון</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#E81E76] focus:ring-1 focus:ring-[#E81E76]" 
                        placeholder="05X-XXXXXXX" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">מייל (לשליחת אישור)</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#E81E76] focus:ring-1 focus:ring-[#E81E76]" 
                        placeholder="your@email.com" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">לאיזה שיעור תרצו להצטרף?</label>
                      <select 
                        required
                        value={formData.classType}
                        onChange={(e) => setFormData({...formData, classType: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-[#E81E76] focus:ring-1 focus:ring-[#E81E76] bg-white text-gray-700" 
                      >
                        <option value="" disabled>בחרי שיעור...</option>
                        {/* השתמשנו ברשימת השיעורים שהבאנו מגוגל שיטס! */}
                        {lessonsList.length > 0 ? (
                           lessonsList.map((cls, idx) => (
                             <option key={idx} value={cls.name}>{cls.name}</option>
                           ))
                        ) : (
                           <>
                             <option value="זומבה קידס ג'וניור">זומבה קידס ג'וניור</option>
                             <option value="זומבה אימהות ונערות">זומבה אימהות ונערות</option>
                           </>
                        )}
                      </select>
                    </div>

                    <button 
                      disabled={isSubmitting}
                      className={`w-full text-white font-bold text-lg p-4 rounded-xl mt-4 shadow-lg transition-colors
                        ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E81E76] hover:bg-[#c91866]'}`}
                    >
                      {isSubmitting ? 'שולח...' : 'שלח פרטים'}
                    </button>
                  </form>
                </>
              )}
            </div>
            <div className="flex-1 w-full mt-8 md:mt-0">
              <img 
                src="/IMG-20260830-WA0089.jpg" 
                alt="מתיחות וזומבה" 
                className="w-full h-auto rounded-3xl shadow-xl transform md:rotate-2 md:hover:rotate-0 transition-transform duration-300 border-4 border-[#B7D928]"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-heebo bg-[#ffffff]" dir="rtl">
      {/* פופ-אפ יצירת קשר למחשב */}
      {isContactPopupOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl animate-fade-in border-t-8 border-[#E81E76]">
            <button 
              onClick={() => setIsContactPopupOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="w-16 h-16 bg-[#B7D928] text-[#2E2E2E] rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={32} />
            </div>
            <h3 className="text-2xl font-black text-[#2E2E2E] mb-2">דברו איתנו</h3>
            <p className="text-gray-600 mb-6">מוזמנים להתקשר ולתאם אימון ניסיון</p>
            <a href="tel:0505794659" className="text-3xl font-bold text-[#E81E76] hover:underline" dir="ltr">
              050-579-4659
            </a>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div 
            className="cursor-pointer z-50" 
            onClick={() => {
              setCurrentPage('home');
              setIsMobileMenuOpen(false);
            }}
          >
            <img src="/zumba-fitness-seeklogo.svg" alt="Zumba Logo" className="h-10 sm:h-12 md:h-16" />
          </div>
          
          <nav className="hidden md:flex gap-8 font-bold text-lg text-[#2E2E2E]">
            <button 
              onClick={() => setCurrentPage('about')}
              className={`hover:text-[#E81E76] transition-colors ${currentPage === 'about' ? 'text-[#E81E76]' : ''}`}
            >
              אודות
            </button>
            <button 
              onClick={() => setCurrentPage('faq')}
              className={`hover:text-[#E81E76] transition-colors ${currentPage === 'faq' ? 'text-[#E81E76]' : ''}`}
            >
              שאלות נפוצות
            </button>
            <button 
              onClick={() => setCurrentPage('schedule')}
              className={`hover:text-[#E81E76] transition-colors ${currentPage === 'schedule' ? 'text-[#E81E76]' : ''}`}
            >
              מערכת שעות
            </button>
            <button 
              onClick={() => setCurrentPage('register')}
              className="bg-[#B7D928] text-[#2E2E2E] px-6 py-1.5 rounded-full hover:bg-[#a3c223] transition-colors shadow-sm"
            >
              הרשמה
            </button>
          </nav>

          <button 
            className="md:hidden p-2 text-gray-600 focus:outline-none z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-full bg-current transition duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </div>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl py-4 px-6 flex flex-col gap-4 text-center z-40 animate-fade-in">
            <button 
              onClick={() => { setCurrentPage('about'); setIsMobileMenuOpen(false); }}
              className={`text-lg font-bold py-2 ${currentPage === 'about' ? 'text-[#E81E76]' : 'text-gray-700'}`}
            >
              אודות
            </button>
            <button 
              onClick={() => { setCurrentPage('faq'); setIsMobileMenuOpen(false); }}
              className={`text-lg font-bold py-2 border-t border-gray-50 ${currentPage === 'faq' ? 'text-[#E81E76]' : 'text-gray-700'}`}
            >
              שאלות נפוצות
            </button>
            <button 
              onClick={() => { setCurrentPage('schedule'); setIsMobileMenuOpen(false); }}
              className={`text-lg font-bold py-2 border-t border-gray-50 ${currentPage === 'schedule' ? 'text-[#E81E76]' : 'text-gray-700'}`}
            >
              מערכת שעות
            </button>
            <button 
              onClick={() => { setCurrentPage('register'); setIsMobileMenuOpen(false); }}
              className="bg-[#E81E76] text-white px-6 py-3 rounded-full font-bold text-lg mt-2 shadow-md"
            >
              הרשמה
            </button>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {renderContent()}
      </main>

      {/* פוטר מרכזי מיושר לאמצע */}
      <footer id="contact-footer" className="bg-[#2E2E2E] text-white py-12 mt-auto">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center gap-8">
          <div>
            <img src="/zumba-fitness-seeklogoonecolor.svg" alt="Zumba" className="h-16 mb-4 mx-auto filter brightness-0 invert" />
            <p className="text-white text-lg">הצטרפו למסיבת הכושר הטובה ביותר בעיר.</p>
          </div>
          
          <div>
            <h4 className="text-2xl font-bold !text-white mb-6">דברו איתנו / עקבו אחרינו</h4>
            <div className="flex justify-center gap-6 flex-wrap">
              <button 
                onClick={handlePhoneClick}
                className="bg-white/10 p-4 rounded-full hover:bg-[#E81E76] transition-colors text-white group"
                aria-label="Phone"
              >
                <Phone size={28} className="group-hover:scale-110 transition-transform" />
              </button>
              
              <a 
                href="mailto:shirangefen@gmail.com" 
                className="bg-white/10 p-4 rounded-full hover:bg-[#E81E76] transition-colors text-white group"
                aria-label="Email"
              >
                <Mail size={28} className="group-hover:scale-110 transition-transform" />
              </a>

              <a 
                href="https://www.instagram.com/shiran.gefen/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white/10 p-4 rounded-full hover:bg-[#E81E76] transition-colors text-white group"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              <a 
                href="https://www.facebook.com/shiranigorgefen" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white/10 p-4 rounded-full hover:bg-[#E81E76] transition-colors text-white group"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}