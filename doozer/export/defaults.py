from doozer.export import Exporter
import csv
import smtplib
import StringIO

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class MailExport(Exporter):
    name = "email"
    path = "email"
    description = "send the report as an email"

    to = None
    from_address = 'doozer'
    host = 'localhost'
    port = 25

    def form(self, data):
        return {"fields": [{"id": "email", "text": "Email", "required": True}]}

    def export(self, form, results):
        if 'email' in form:
            to_address = form['email']
        else:
            to_address = self.to

        # compose into an email
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "[Doozer] Results"
        msg['From'] = self.from_address
        msg['To'] = to_address

        text = generate_csv(results)
        html = """\
        <html>
          <head></head>
          <body>
            <p>Doozer Results</p>
            %s
          </body>
        </html>
        """

        table_rows = []
        for row in results.values():
            table_rows.append("<tr>")
            for field in row:
                table_rows.append("<td>%s</td>" % (field))
            table_rows.append("</tr>")

        # Record the MIME types of both parts - text/plain and text/html.
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html % ("\n".join(table_rows)), 'html')

        msg.attach(part1)
        msg.attach(part2)

        s = smtplib.SMTP(self.host, self.port)

        s.sendmail(self.from_address, to_address, msg.as_string())
        s.quit()

        return "sent"


class CSVExport(Exporter):
    name = "csv"
    path = "csv"
    description = "download as csv"

    def export(self, form, results):
        return generate_csv(results)


def generate_csv(results):
    output = StringIO.StringIO()
    writer = csv.writer(output)

    for row in results.values():
        writer.writerow(row)

    return output.getvalue()
