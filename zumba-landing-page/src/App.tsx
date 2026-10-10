import React, { useState } from 'react';
import {Phone, Clock, User, CheckCircle } from 'lucide-react';
import './App.css';

type Page = 'home' | 'about' | 'schedule' | 'register';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // משתנה חדש שאחראי להציג את הודעת ההצלחה היפה
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsSubmitting(true);

    try {
      // 1. שליחה לגוגל שיטס (ללא תאריך, בדיוק כפי שביקשת)
      const GOOGLE_SHEET_API_URL = 'הכניסי_כאן_את_הכתובת_שתקבלי_משלב_הגוגל_שיטס'; 
      
      if (GOOGLE_SHEET_API_URL !== 'הכניסי_כאן_את_הכתובת_שתקבלי_משלב_הגוגל_שיטס') {
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
                'מייל': formData.email
              }
            ]
          })
        });
      }

      // 2. שליחת מייל תודה ללקוח באמצעות EmailJS
      const EMAILJS_SERVICE_ID = 'service_3fuopvh';
      const EMAILJS_TEMPLATE_ID = 'template_xc1mbpd';
      const EMAILJS_PUBLIC_KEY = 'PqtnW83lm59F-g6qk';

      if (EMAILJS_SERVICE_ID !== 'service_3fuopvh') {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: {
              to_name: formData.name,
              to_email: formData.email,
              // אפשר להוסיף כאן עוד פרטים שיופיעו במייל
            }
          })
        });
      }

      // הצגת הודעת ההצלחה המעוצבת
      setIsSuccess(true);
      
    } catch (error) {
      alert('אופס, משהו השתבש. אנא נסו שוב או צרו קשר טלפוני.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setFormData({ name: '', phone: '', email: '' });
    setCurrentPage('home');
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
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setCurrentPage('register')}
                  className="bg-[#E81E76] text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-[#c91866] transition-colors shadow-lg"
                >
                  הצטרפי עכשיו
                </button>
                <button 
                  onClick={() => setCurrentPage('schedule')}
                  className="bg-[#B7D928] text-[#2E2E2E] px-8 py-3 rounded-full font-bold text-lg hover:bg-[#a3c223] transition-colors shadow-lg"
                >
                  מערכת שעות
                </button>
              </div>
            </div>
            <div className="flex-1">
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
          <div className="py-12 px-6 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-[#2E2E2E] mb-4">מי אנחנו?</h2>
              <div className="w-24 h-2 bg-[#E81E76] mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-lg text-gray-700">
                <p>
                  אנחנו מאמינים שכושר לא צריך להיות משעמם או להרגיש כמו מטלה. בזומבה, אנחנו הופכים כל אימון למסיבה לטינית סוחפת.
                </p>
                <p>
                  הסטודיו שלנו מציע יחס אישי, אנרגיות שירימו אתכם לשמיים, וקהילה תומכת של מתאמנים בכל הגילאים. בין אם אתם רק מתחילים או כבר רקדנים מנוסים, יש מקום לכולם ברחבה שלנו.
                </p>
                <button 
                  onClick={() => setCurrentPage('register')}
                  className="mt-6 border-2 border-[#E81E76] text-[#E81E76] px-6 py-2 rounded-full font-bold hover:bg-[#E81E76] hover:text-white transition-colors"
                >
                  בואו לנסות
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="/IMG-20260830-WA0082.jpg" 
                  alt="מדריכת זומבה" 
                  className="w-full h-64 object-cover rounded-2xl shadow-lg border-2 border-[#B7D928]"
                />
                <img 
                  src="/IMG-20260830-WA0081.jpg" 
                  alt="אימון זומבה" 
                  className="w-full h-64 object-cover rounded-2xl shadow-lg border-2 border-[#FDE026] mt-8"
                />
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="py-12 px-6 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-[#2E2E2E] mb-4">מערכת שעות</h2>
              <div className="w-24 h-2 bg-[#B7D928] mx-auto rounded-full"></div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              {[
                { day: 'שני', time: '20:30 - 21:30', name: 'זומבה נשים', place: 'סטודיו גלגולים - כרמיאל, המגל 10', trainer: 'שירן גפן' },
                { day: 'רביעי', time: '16:15 - 17:15', name: "זומבה קידס ג'וניור", place: 'מועדון חברים - מכמנים', trainer: 'שירן גפן' },
                { day: 'רביעי', time: '17:30 - 18:30', name: 'זומבה אימהות ובנות', place: 'מועדון חברים - מכמנים', trainer: 'שירן גפן' },
                { day: 'חמישי', time: '20:30 - 21:30', name: 'זומבה נשים', place: 'סטודיו גלגולים - כרמיאל, המגל 10', trainer: 'שירן גפן' },
              ].map((cls, idx) => (
                <div key={idx} className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="bg-[#FDE026] text-[#2E2E2E] w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold shadow-sm">
                      <span>{cls.day}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#2E2E2E]">{cls.name}</h3>
                      <div className="flex items-center gap-2 text-gray-500 mt-1">
                        <Clock size={16} />
                        <span>{cls.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
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
          </div>
        );

      case 'register':
        return (
          <div className="py-12 px-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 w-full bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-[#E81E76] min-h-[450px] flex flex-col justify-center">
              
              {/* מציג את הודעת ההצלחה אם המשתמש סיים בהצלחה, אחרת מציג את הטופס */}
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
                        placeholder="שירן גפן" 
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
                        placeholder="050-579-4659" 
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
                        placeholder="shiran@example.com" 
                      />
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
            <div className="flex-1 hidden md:block">
              <img 
                src="/IMG-20260830-WA0089.jpg" 
                alt="מתיחות וזומבה" 
                className="w-full h-auto rounded-3xl shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300 border-4 border-[#B7D928]"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-heebo bg-[#ffffff]" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className="cursor-pointer" 
            onClick={() => setCurrentPage('home')}
          >
            <img src="/zumba-fitness-seeklogo.svg" alt="Zumba Logo" className="h-12 md:h-16" />
          </div>
          
          <nav className="hidden md:flex gap-8 font-bold text-lg text-[#2E2E2E]">
            <button 
              onClick={() => setCurrentPage('home')} 
              className={`hover:text-[#E81E76] transition-colors ${currentPage === 'home' ? 'text-[#E81E76]' : ''}`}
            >
              ראשי
            </button>
            <button 
              onClick={() => setCurrentPage('about')}
              className={`hover:text-[#E81E76] transition-colors ${currentPage === 'about' ? 'text-[#E81E76]' : ''}`}
            >
              אודות
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
            className="md:hidden bg-[#E81E76] text-white px-4 py-2 rounded-full font-bold"
            onClick={() => setCurrentPage('register')}
          >
            הרשמה
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-[#2E2E2E] text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center md:text-right">
          <div>
            <img src="/zumba-fitness-seeklogoonecolor.svg" alt="Zumba" className="h-12 mb-4 mx-auto md:mx-0 filter brightness-0 invert" />
            <p className="text-white">הצטרפו למסיבת הכושר הטובה ביותר בעיר.</p>
          </div>
          
          <div>
            <h4 className="text-xl font-bold !text-white mb-4">יצירת קשר</h4>
            <div className="space-y-3">
              <div className="flex justify-center md:justify-start items-center gap-2">
                <Phone size={18} className="text-[#B7D928]" />
                <span dir="ltr" className="text-white font-medium">050-579-4659</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-bold !text-white mb-4">עקבו אחרינו</h4>
            <div className="flex justify-center md:justify-start gap-4">
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-[#E81E76] transition-colors text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-[#E81E76] transition-colors text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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