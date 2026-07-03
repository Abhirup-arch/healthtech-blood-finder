// React import removed due to verbatimModuleSyntax/JSX config
import { type BloodCentre } from '../hooks/useBloodData';

interface Props {
  centre: BloodCentre;
}

export default function BloodBankCard({ centre }: Props) {
  return (
    <div className="glass-panel p-6 rounded-2xl animate-fade-in hover:scale-[1.02] transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{centre.bloodCentreName}</h3>
          <p className="text-sm text-gray-400">{centre.city}, {centre.state}</p>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-start text-gray-300">
          <svg className="w-5 h-5 mr-3 mt-0.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span className="text-sm">{centre.address || 'Address not provided'}</span>
        </div>
        
        {centre.contactPerson && (
          <div className="flex items-center text-gray-300">
            <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span className="text-sm">{centre.contactPerson} {centre.designation ? `(${centre.designation})` : ''}</span>
          </div>
        )}

        <div className="flex items-center text-gray-300">
          <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          <span className="text-sm">{centre.phone || 'Phone not provided'}</span>
        </div>

        {centre.email && (
          <div className="flex items-center text-gray-300">
            <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <span className="text-sm">{centre.email}</span>
          </div>
        )}
      </div>

      <button className="w-full py-2 px-4 bg-primary/20 hover:bg-primary/30 text-primary font-medium rounded-lg transition-colors duration-300 flex items-center justify-center">
        <span>Contact Centre</span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </button>
    </div>
  );
}
