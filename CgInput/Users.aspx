<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="~/Users.aspx.cs" Inherits="CgInput.Users" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <title>USERS</title>
    <meta name="description" content="" />
    <meta name="viewport" content="width=device-width" />
    <link rel="stylesheet" href="theme/css/bootstrap.min.css" />
    <link rel="stylesheet" href="theme/css/icons.min.css" />
    <!--[if lte IE 7]><link rel="stylesheet" href="theme/css/icons-ie7.min.css"><![endif]-->
    <link rel="stylesheet" href="theme/css/main.css" />
    <script src="theme/js/vendor/modernizr-2.6.2-respond-1.1.0.min.js"></script>
</head>
<body>
    <form id="form1" runat="server">
           <a href="Users_Insert.aspx?USER=0" title="کاربر جدید">
                   <img src="Theme/Icon/add.png" /></a>
        <div>
            
            <asp:GridView ID="GridView1" runat="server" AutoGenerateColumns="false" CssClass="requests table table-striped table-bordered table-hover" OnRowCommand="GridView1_RowCommand">
                <Columns>
                    <asp:TemplateField HeaderText="#">
                        <ItemTemplate>
                            <%# Container.DataItemIndex+1%>
                        </ItemTemplate>
                    </asp:TemplateField>                  
                    <asp:TemplateField HeaderText="نام کاربری">
                        <ItemTemplate>
                            <a href='<%# EditPage(Eval("UserName")) %>' title="برای ویرایش کلیک کنید" href=""><%#Eval("UserName") %></a>
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="فعال">
                        <ItemTemplate>
                            <asp:ImageButton ID="ImgBtnActive" runat="server" CommandArgument='<%# Eval("USERNAME") %>' CommandName="Active" ImageUrl='<%# BoolToImage(Eval("IsApproved")) %>' />
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="قفل">
                        <ItemTemplate>
                            <asp:ImageButton Width="26" ID="ImgBtnLock" runat="server" CommandArgument='<%# Eval("USERNAME") %>' CommandName="Lock" ImageUrl='<%# IsLock(Eval("IsLockedOut")) %>' />
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="آنلاین">
                        <ItemTemplate>
                            <asp:ImageButton ID="ImgBtnOnline" runat="server" CommandArgument='<%# Eval("USERNAME") %>' CommandName="ToggleActive" ImageUrl='<%# IsOnline(Eval("IsOnline")) %>' />
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="ایجاد">
                        <ItemTemplate>
                            <a href=""><%# DateConversion.GD2JD(DateTime.Parse(Eval("CreationDate").ToString()),true) %></a>
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="آخرین ورود">
                        <ItemTemplate>
                            <a href=""><%# DateConversion.GD2JD(DateTime.Parse(Eval("LastLoginDate").ToString()),true) %></a>
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="آخرین قفل">
                        <ItemTemplate>
                            <a href=""><%# DateConversion.GD2JD(DateTime.Parse(Eval("LastLockoutDate").ToString()),true) %></a>
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="تغییر رمز">
                        <ItemTemplate>
                            <a href=""><%# DateConversion.GD2JD(DateTime.Parse(Eval("LastPasswordChangedDate").ToString()),true) %></a>
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="حذف">
                        <ItemTemplate>
                            <asp:ImageButton ID="imgBtnDelete" OnClientClick="return confirm('آیا کاربر انتخاب شده حذف گردد؟');"
                                CommandName="DeleteUser" CommandArgument='<%# Eval("USERNAME") %>'
                                ImageUrl="Theme/Icon/delete.png" runat="server" />
                        </ItemTemplate>
                    </asp:TemplateField>
                </Columns>
            </asp:GridView>
        </div>
    </form>
    <script src="theme/js/vendor/jquery-1.9.1.min.js"></script>
    <script src="theme/js/vendor/bootstrap.min.js"></script>
    <script src="theme/js/main.js"></script>
</body>
</html>
