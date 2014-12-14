using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace CgInput
{
    public partial class Login : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!Page.IsPostBack)
            {
                Response.Cookies["approles"].Expires = DateTime.Now.AddDays(-1);
                FormsAuthentication.SignOut();
                HttpContext.Current.Session.Abandon();
                //Response.Redirect("~/login.aspx");
            }
        }

        protected void Login1_LoggingIn(object sender, LoginCancelEventArgs e)
        {
        //    MSCaptcha.CaptchaControl Ms = (MSCaptcha.CaptchaControl)(Login1.FindControl("Captcha1"));
        //    TextBox Txt = (TextBox)(Login1.FindControl("txtCaptcha"));



            //Ms.ValidateCaptcha(Txt.Text.Trim());
            //if (!Ms.UserValidated)
            // {
            //     Response.Redirect("/login");
            // }
        }
    }
}