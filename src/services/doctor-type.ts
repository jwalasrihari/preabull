/**
 * Represents a type of doctor.
 */
export interface DoctorType {
  /**
   * The name of the doctor type (e.g., "Cardiologist", "Neurologist").
   */
  name: string;
}

/**
 * Asynchronously retrieves a list of doctor types.
 *
 * @returns A promise that resolves to an array of DoctorType objects.
 */
export async function getDoctorTypes(): Promise<DoctorType[]> {
  // TODO: Implement this by calling an API or database.

  return [
    {name: 'General Physician'},
    {name: 'Cardiologist'},
    {name: 'Neurologist'},
    {name: 'Dermatologist'},
    {name: 'Ophthalmologist'},
    {name: 'Pediatrician'},
    {name: 'Obstetrician/Gynecologist'},
    {name: 'Orthopedic Surgeon'},
    {name: 'Urologist'},
    {name: 'Psychiatrist'},
    {name: 'Endocrinologist'},
    {name: 'Gastroenterologist'},
    {name: 'Pulmonologist'},
    {name: 'Nephrologist'},
    {name: 'Hematologist'},
    {name: 'Oncologist'},
    {name: 'Rheumatologist'},
    {name: 'Infectious Disease Specialist'},
    {name: 'Allergist/Immunologist'},
    {name: 'Emergency Medicine Physician'},
    {name: 'Anesthesiologist'},
    {name: 'Radiologist'},
    {name: 'Pathologist'},
    {name: 'Surgeon'},
    {name: 'ENT Specialist (Otolaryngologist)'},
    {name: 'Dentist'},
    {name: 'Physical Therapist'},
    {name: 'Chiropractor'},
    {name: 'Podiatrist'},
    {name: 'Speech Therapist'},
    {name: 'Occupational Therapist'},
    {name: 'Dietitian/Nutritionist'},
    {name: 'Psychologist'},
    {name: 'Social Worker'},
    {name: 'Pharmacist'},
    {name: 'Veterinarian'},
    {name: 'Naturopathic Doctor'},
    {name: 'Acupuncturist'},
    {name: 'Homeopathic Doctor'},
    {name: 'Medical Geneticist'},
    {name: 'Geriatrician'},
    {name: 'Sports Medicine Physician'},
    {name: 'Pain Management Specialist'},
    {name: 'Hospice and Palliative Medicine Physician'},
    {name: 'Addiction Medicine Physician'},
    {name: 'Sleep Medicine Physician'},
    {name: 'Interventional Radiologist'},
    {name: 'Nuclear Medicine Physician'},
    {name: 'Radiation Oncologist'},
    {name: 'Clinical Neurophysiologist'},
    {name: 'Rehabilitation Physician (Physiatrist)'},
    {name: 'Colon and Rectal Surgeon'},
    {name: 'Thoracic Surgeon'},
    {name: 'Vascular Surgeon'},
    {name: 'Plastic Surgeon'},
    {name: 'Oral and Maxillofacial Surgeon'},
    {name: 'Neurosurgeon'},
    {name: 'Hand Surgeon'},
    {name: 'Bariatric Surgeon'},
    {name: 'Transplant Surgeon'},
    {name: 'Trauma Surgeon'},
    {name: 'Critical Care Physician (Intensivist)'},
  ];
}

