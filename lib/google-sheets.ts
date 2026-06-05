import { google } from 'googleapis';

export interface Lead {
  name: string;
  email: string;
  phone: string;
  properties: string;
  message?: string;
}

export async function appendLeadToSheet(lead: Lead): Promise<void> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const timestamp = new Date().toLocaleString('de-AT', {
    timeZone: 'Europe/Vienna',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: 'Leads!A:G',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        timestamp,
        lead.name,
        lead.email,
        lead.phone,
        lead.properties,
        lead.message ?? '',
        'Neu',
      ]],
    },
  });
}
