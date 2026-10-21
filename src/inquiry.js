export function makeInquiry({ name, email, company, message }) {
  const fields = [name, email, company, message].map(value => String(value ?? '').trim());
  if (fields.some(value => !value)) throw new Error('Please complete all fields.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields[1])) throw new Error('Please enter a valid email address.');
  return `PRODUCT INQUIRY\n\nName: ${fields[0]}\nEmail: ${fields[1]}\nCompany: ${fields[2]}\n\nRequirements:\n${fields[3]}\n`;
}
