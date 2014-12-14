using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace CgInput
{
    public partial class SignOut : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            Response.Cookies["approles"].Expires = DateTime.Now.AddDays(-1);
            FormsAuthentication.SignOut();
            HttpContext.Current.Session.Abandon();
            //  Response.Output.Write("<script>window.close();</script>");
            Response.Redirect("~/login.aspx");
            Response.Redirect("~/login.aspx");
           // Response.Redirect("/",true);
        }
    }
}