using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace CgInput
{
    public partial class Users : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!Page.IsPostBack)
            {
                MembershipUserCollection Users = Membership.GetAllUsers();
                GridView1.DataSource = Users;
                GridView1.DataBind();
            }
        }
        protected string GetUserFullName(object UserName)
        {
            string ReturnValue = "";
            //Bazaar.BusinessLayer.DataLayer.USERS_DETAILSSql User_Sql = new BusinessLayer.DataLayer.USERS_DETAILSSql();
            //List<Bazaar.BusinessLayer.USERS_DETAILS> UserObj = User_Sql.SelectByField("USRNM", UserName);
            //if (UserObj.Count==1)
            //{
            //  ReturnValue= UserObj[0].FULLNAME;
            //}
            //else
            //{
            //    ReturnValue = "----";
            //}
            return ReturnValue;
        }
        protected string BoolToImage(object InValue)
        {
            if (bool.Parse(InValue.ToString()))
            {
                return "~/Theme/Icon/Yes.png";
            }
            else
            {
                return "~/Theme/Icon/No.png";
            }
        }
        protected string IsOnline(object InValue)
        {
            if (bool.Parse(InValue.ToString()))
            {
                return "~/Theme/Icon/globe_Green.png";
            }
            else
            {
                return "~/Theme/Icon/globe_Gray.png";
            }
        }
        protected string IsLock(object InValue)
        {
            if (bool.Parse(InValue.ToString()))
            {
                return "~/Theme/Icon/Lock.png";
            }
            else
            {
                return "~/Theme/Icon/unlock.png";
            }
        }
        protected string EditPage(object InValue)
        {
            string Url = "";

            Url = "Users_Insert.aspx?USER=" + InValue.ToString();

            return Url;
        }

        protected void GridView1_RowCommand(object sender, GridViewCommandEventArgs e)
        {
            if (e.CommandName == "Active")
            {
                MembershipUser Usr = Membership.GetUser(e.CommandArgument.ToString());
                if (Usr.IsApproved)
                {

                    Usr.IsApproved = false;
                }
                else
                {
                    Usr.IsApproved = true;
                }
                Membership.UpdateUser(Usr);
            }

            if (e.CommandName == "Lock")
            {

                MembershipUser Usr = Membership.GetUser(e.CommandArgument.ToString());
                if (Usr.IsLockedOut)
                {
                    Usr.UnlockUser();
                }
                Membership.UpdateUser(Usr);
            }

            if (e.CommandName == "DeleteUser")
            {
                MembershipUser Usr = Membership.GetUser(e.CommandArgument.ToString());
                Membership.DeleteUser(e.CommandArgument.ToString(), true);
            }



            MembershipUserCollection Users = Membership.GetAllUsers();
            GridView1.DataSource = Users;
            GridView1.DataBind();

        }
    }
}