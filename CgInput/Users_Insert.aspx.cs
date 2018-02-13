using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace CgInput
{
    public partial class Users_Insert : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {




            if (!Page.IsPostBack)
            {



                MembershipUser Usr = Membership.GetUser(Request.QueryString["USER"].Trim());






                if (Request.QueryString["USER"].Trim() != "0")
                {
                    TxtUserName.Enabled = false;
                    TxtPass.Text = Usr.GetPassword();
                    TxtPassConfirm.Text = Usr.GetPassword();
                    TxtUserName.Text = Usr.UserName;


                }
                string[] Rls = Roles.GetAllRoles();
                for (int i = 0; i < Rls.Length; i++)
                {
                    DropDownList1.Items.Add(Rls[i]);
                    if (Request.QueryString["USER"].Trim() != "0")
                    {
                        if (Roles.IsUserInRole(Usr.UserName, Rls[i]))
                        {
                            DropDownList1.SelectedIndex = i;
                        }
                    }

                }
            }
        }
        protected void LoadMenus(string UserName)
        {
            //Bazaar.BusinessLayer.DataLayer.USERS_DETAILSSql User_Sql = new BusinessLayer.DataLayer.USERS_DETAILSSql();
            //Bazaar.BusinessLayer.USERS_DETAILS UserObj = User_Sql.SelectByField("USRNM", UserName)[0];

            //long UserMenuSec = long.Parse(UserObj.MENU_SEC);

            //Bazaar.BusinessLayer.DataLayer.MENUSSql MenuSql = new BusinessLayer.DataLayer.MENUSSql();
            //List<Bazaar.BusinessLayer.MENUS> MenuList = MenuSql.SelectCondition(" pid=0 and kind=1 order by sort");
            //foreach (Bazaar.BusinessLayer.MENUS item in MenuList)
            //{
            //    TreeNode Tr = new TreeNode(item.TITLE, item.VALUE);

            //    if (long.Equals((Convert.ToInt64(UserMenuSec) & (Convert.ToInt64(item.VALUE))), (Convert.ToInt64(item.VALUE))))
            //    {
            //        Tr.Checked = true;
            //    }
            //    else
            //    {
            //        Tr.Checked = false;
            //    }

            //    List<Bazaar.BusinessLayer.MENUS> SubMenuList = MenuSql.SelectCondition(" pid=" + item.ID + " and kind=1 order by sort ");


            //    foreach (Bazaar.BusinessLayer.MENUS SubItem in SubMenuList)
            //    {
            //        TreeNode TrChild = new TreeNode(SubItem.TITLE, SubItem.VALUE);

            //        if (long.Equals((Convert.ToInt64(UserMenuSec) & (Convert.ToInt64(SubItem.VALUE))), (Convert.ToInt64(SubItem.VALUE))))
            //        {
            //            TrChild.Checked = true;
            //        }
            //        else
            //        {
            //            TrChild.Checked = false;
            //        }
            //        Tr.ChildNodes.Add(TrChild);
            //    }
            //    tvMenus.Nodes.Add(Tr);
            //}

        }
        protected void LoadMenus()
        {


            //Bazaar.BusinessLayer.DataLayer.MENUSSql MenuSql = new BusinessLayer.DataLayer.MENUSSql();
            //List<Bazaar.BusinessLayer.MENUS> MenuList = MenuSql.SelectCondition(" pid=0  and kind=1 order  by sort");
            //foreach (Bazaar.BusinessLayer.MENUS item in MenuList)
            //{
            //    TreeNode Tr = new TreeNode(item.TITLE, item.VALUE);


            //    List<Bazaar.BusinessLayer.MENUS> SubMenuList = MenuSql.SelectCondition(" pid=" + item.ID + " and kind=1 order by sort ");


            //    foreach (Bazaar.BusinessLayer.MENUS SubItem in SubMenuList)
            //    {
            //        TreeNode TrChild = new TreeNode(SubItem.TITLE, SubItem.VALUE);


            //        Tr.ChildNodes.Add(TrChild);
            //    }
            //    tvMenus.Nodes.Add(Tr);
            //}

        }

        protected void LoadAccess(string UserName)
        {
            //Bazaar.BusinessLayer.DataLayer.USERS_DETAILSSql User_Sql = new BusinessLayer.DataLayer.USERS_DETAILSSql();
            //Bazaar.BusinessLayer.USERS_DETAILS UserObj = User_Sql.SelectByField("USRNM", UserName)[0];

            //long UserAccessSec = long.Parse(UserObj.ACCESS_SEC);

            //Bazaar.BusinessLayer.DataLayer.ACCESSSql ACCESSSql = new BusinessLayer.DataLayer.ACCESSSql();
            //List<Bazaar.BusinessLayer.ACCESS> ACCESSSqlList = ACCESSSql.SelectAll();
            //foreach (Bazaar.BusinessLayer.ACCESS item in ACCESSSqlList)
            //{
            //    TreeNode Tr = new TreeNode(item.TITLE, item.VALUE);

            //    if (long.Equals((Convert.ToInt64(UserAccessSec) & (Convert.ToInt64(item.VALUE))), (Convert.ToInt64(item.VALUE))))
            //    {
            //        Tr.Checked = true;
            //    }

            //    tvAccess.Nodes.Add(Tr);
            //}

        }
        protected void LoadAccess()
        {

            //Bazaar.BusinessLayer.DataLayer.ACCESSSql ACCESSSql = new BusinessLayer.DataLayer.ACCESSSql();
            //List<Bazaar.BusinessLayer.ACCESS> ACCESSSqlList = ACCESSSql.SelectAll();

            //foreach (Bazaar.BusinessLayer.ACCESS item in ACCESSSqlList)
            //{
            //    TreeNode Tr = new TreeNode(item.TITLE, item.VALUE);


            //    tvAccess.Nodes.Add(Tr);
            //}

        }

        protected void btnSave_Click(object sender, EventArgs e)
        {
            if (Request.QueryString["USER"].Trim() != "0")
            {
                MembershipUser Usr = Membership.GetUser(Request.QueryString["USER"].Trim());
                if (TxtPass.Text.Trim() == TxtPassConfirm.Text.Trim())
                {
                    if (Usr.GetPassword() != TxtPass.Text.Trim())
                    {
                        Usr.ChangePassword(Usr.GetPassword(), TxtPass.Text.Trim());
                    }
                }

           
                string[] Rls = Roles.GetAllRoles();
                for (int i = 0; i < Rls.Length; i++)
                {

                    if (Roles.IsUserInRole(TxtUserName.Text.ToString().Trim(), Rls[i]))
                    {
                        Roles.RemoveUserFromRole(TxtUserName.Text.ToString().Trim(), Rls[i]);
                    }
                }
                Roles.AddUserToRole(TxtUserName.Text.ToString().Trim(), DropDownList1.SelectedItem.Text);

            }

            else
            {
                MembershipUser Usr;
                if (TxtPass.Text.Trim() == TxtPassConfirm.Text.Trim())
                {
                    if (TxtUserName.Text.Trim().Length > 0)
                    {
                        Usr = Membership.CreateUser(TxtUserName.Text.Trim(), TxtPass.Text.Trim());
                       
                        string[] Rls = Roles.GetAllRoles();
                        for (int i = 0; i < Rls.Length; i++)
                        {

                            if (Roles.IsUserInRole(TxtUserName.Text.ToString().Trim(), Rls[i]))
                            {
                                Roles.RemoveUserFromRole(TxtUserName.Text.ToString().Trim(), Rls[i]);
                            }
                        }
                        Roles.AddUserToRole(TxtUserName.Text.ToString().Trim(), DropDownList1.SelectedItem.Text);
                    }
                }
            }
            Response.Redirect("users.aspx");

        }
    }
}

