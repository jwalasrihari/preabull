## PreConsultaBull – Your Personalized Pre-Consultation Guide

### Inspiration  
Visiting a doctor can often feel overwhelming, especially when you're unsure how to prepare for the appointment. Inspired by this common problem, we wanted to build a tool that empowers patients to take control of their health journey before even stepping into the consultation room.

### How We Built It  
- **Frontend:** Built with **Next.js** and **TypeScript** for scalability and type safety  
- **Backend:** Powered by **Firebase Functions**  
- **AI Integration:** Used **Gemini (via Firebase Genkit)** to generate tailored recommendations  
- **Deployment:** Hosted on **Vercel** with a custom domain from **GoDaddy** (`preconsultabull.us`)  
- **Docker:** Containerized for easy local testing and consistent deployment  

###  What the AI Does  
The user inputs their health concern and selects the type of doctor they’re visiting (e.g., dermatologist, cardiologist). The AI then provides:
- Diet suggestions  
- Sleep guidance  
- Physical/mental health tips  
- Do’s and don’ts specific to their situation  

### What We Learned  
- Integrating **Gemini AI** through **Firebase Genkit**  
- Managing custom domains with **Vercel + GoDaddy**  
- Handling environment variables securely (like API keys)  
- Dockerizing a full-stack TypeScript app  
- Importance of prompt engineering for consistent AI responses  
- creating a domain using Godaddy and porkbun

### Challenges  
- Getting the `GOOGLE_GENAI_API_KEY` recognized properly in the Vercel environment  
- Debugging opaque errors from **Next.js server components**  
- Balancing dynamic AI output with static frontend design  
- Managing state and API calls cleanly in React with async functions  

### Final Thoughts  
PreConsultaBull is our attempt to bridge the gap between confusion and confidence in healthcare. By using AI responsibly, we aimed to create a tool that’s supportive, informative, and easy to use for anyone preparing for a doctor’s visit.
