<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Users_Insert.aspx.cs" Inherits="CgInput.Users_Insert" %>


<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <title>EDIT USER</title>
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
        <table style="width: 100%;">
            <tr>
                <td>نام کاربری</td>
                <td>
                    <asp:TextBox ID="TxtUserName" runat="server"></asp:TextBox>
                </td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
            </tr>
            <tr>
                <td>رمز</td>
                <td>
                    <asp:TextBox ID="TxtPass" runat="server"></asp:TextBox>
                </td>
                <td>تکرار رمز</td>
                <td>
                    <asp:TextBox ID="TxtPassConfirm" runat="server"></asp:TextBox>
                </td>
            </tr>
            <tr>
                <td>کرال</td>
                <td>
                    <asp:DropDownList ID="DropDownList1" runat="server">
                    </asp:DropDownList>
                </td>
                <td>&nbsp;</td>
                <td>
                    &nbsp;</td>
            </tr>
            <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>
                    <asp:Button ID="btnSave" runat="server" CssClass="btn-danger" Text="ذخیره" OnClick="btnSave_Click" />
                </td>
            </tr>
        </table>
    </form>
    <script src="theme/js/vendor/jquery-1.9.1.min.js"></script>
    <script src="theme/js/vendor/bootstrap.min.js"></script>
    <script src="theme/js/main.js"></script>
</body>
</html>
