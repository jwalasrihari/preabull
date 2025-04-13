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
    {
      name: 'General Physician',
    },
    {
      name: 'Cardiologist',
    },
    {
      name: 'Neurologist',
    },
    {
      name: 'Gastroenterologist',
    },
  ];
}
