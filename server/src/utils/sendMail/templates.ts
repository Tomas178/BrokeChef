export const getEmailVerifyHtml = async (
  userName: string,
  verifyUrl: string
): Promise<string> => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body style='background-color:rgb(243,244,246);font-family:ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";padding-top:40px;padding-bottom:40px'>
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:rgb(255,255,255);border-radius:8px;max-width:600px;margin:auto;padding:40px">
      <tbody>
        <tr>
          <td>
            <p style="font-size:32px;font-weight:700;color:rgb(17,24,39);text-align:center;margin:0 0 16px 0;line-height:24px">
              Verify Your Email Address
            </p>
            <p style="font-size:16px;color:rgb(55,65,81);margin:0 0 8px 0;line-height:24px">
              Hello ${userName},
            </p>
            <p style="font-size:16px;color:rgb(55,65,81);margin:0 0 16px 0;line-height:24px">
              Thank you for signing up! To complete your registration and secure your account, please verify your email address by clicking the button below.
            </p>
            <p style="text-align:center;margin-bottom:32px">
              <a href="${verifyUrl}" target="_blank" style="background-color:rgb(37,99,235);color:#fff;padding:16px 32px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;display:inline-block;line-height:100%;">
                Verify Email Address
              </a>
            </p>
            <p style="font-size:14px;color:rgb(75,85,99);margin:0 0 8px 0;line-height:20px">
              If the button above doesn't work, you can also copy and paste this link into your browser:
            </p>
            <p style="font-size:14px;color:rgb(37,99,235);word-break:break-word;line-height:24px;margin:0 0 16px 0">
              ${verifyUrl}
            </p>
            <hr style="border-top:1px solid #eaeaea;margin:32px 0" />
            <p style="font-size:14px;color:rgb(75,85,99);margin:0;line-height:24px">
              If you didn't create an account, you can safely ignore this email.
            </p>
            <p style="font-size:14px;color:rgb(75,85,99);margin:32px 0 0 0;line-height:24px">
              Best regards,<br />The BrokeChef Team
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;

export const getPasswordResetHtml = async (
  userName: string,
  resetUrl: string
): Promise<string> => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body
    style='background-color:rgb(243,244,246);font-family:ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";padding-top:40px;padding-bottom:40px'>
    <table
      align="center"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="background-color:rgb(255,255,255);border-radius:8px;box-shadow:none;max-width:600px;margin-left:auto;margin-right:auto;padding:40px">
      <tbody>
        <tr style="width:100%">
          <td>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation">
              <tbody>
                <tr>
                  <td>
                    <p
                      style="font-size:32px;font-weight:700;color:rgb(17,24,39);text-align:center;margin:0;line-height:24px">
                      Reset Your Password
                    </p>
                    <p
                      style="font-size:16px;color:rgb(55,65,81);margin:0;line-height:24px">
                      Hello ${userName},
                    </p>
                    <p
                      style="font-size:16px;color:rgb(55,65,81);margin:0;line-height:24px">
                      We received a request to reset the password for your
                      account. If you made this request, click the button below
                      to create a new password.
                    </p>
                    <table
                      align="center"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="text-align:center;margin-bottom:32px">
                      <tbody>
                        <tr>
                          <td>
                            <a
                              href="${resetUrl}"
                              style="background-color:rgb(220,38,38);color:rgb(255,255,255);padding:16px 32px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;display:inline-block;line-height:100%;max-width:100%;"
                              target="_blank"
                              >Reset Password</a
                            >
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p
                      style="font-size:14px;color:rgb(75,85,99);margin:0 0 8px 0;line-height:20px">
                      If the button above doesn't work, you can also copy
                      and paste this link into your browser:
                    </p>
                    <p
                      style="font-size:14px;color:rgb(37,99,235);word-break:break-all;line-height:24px;margin:0 0 16px 0">
                      ${resetUrl}
                    </p>
                    <hr style="border-top:1px solid #eaeaea;margin:32px 0" />
                    <p
                      style="font-size:14px;color:rgb(75,85,99);margin:0 0 8px 0;line-height:24px">
                      If you didn't request a password reset, you can
                      safely ignore this email. Your password will remain
                      unchanged.
                    </p>
                    <p
                      style="font-size:14px;color:rgb(75,85,99);margin:0;line-height:24px">
                      Best regards,<br />The BrokeChef Security Team
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
            <hr style="border-top:1px solid #eaeaea;margin:32px 0" />
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation">
              <tbody>
                <tr>
                  <td>
                    <p
                      style="font-size:12px;color:rgb(107,114,128);text-align:center;margin:0 0 8px 0;line-height:24px">
                      © 2025 Your Company Name. All rights reserved.
                    </p>
                    <p
                      style="font-size:12px;color:rgb(107,114,128);text-align:center;margin:0 0 8px 0;line-height:24px">
                      123 Business Street, Suite 100, City, State 12345
                    </p>
                    <p
                      style="font-size:12px;color:rgb(107,114,128);text-align:center;margin:0;line-height:24px">
                      <a href="#" style="color:rgb(107,114,128);text-decoration:underline">Unsubscribe</a>
                      |
                      <a href="#" style="color:rgb(107,114,128);text-decoration:underline;margin-left:8px">Privacy Policy</a>
                      |
                      <a href="#" style="color:rgb(107,114,128);text-decoration:underline;margin-left:8px">Contact Support</a>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
