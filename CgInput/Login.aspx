<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Login.aspx.cs" Inherits="CgInput.Login" %>

<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<form id="form1" runat="server">
    <!--[if gt IE 8]><!-->
    <html class="no-js">
    <!--<![endif]-->
    <head>
        <title>iFilm Crawl</title>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width" />
        <link rel="stylesheet" href="css/main.css" />
        <script src="js/modernizr-2.6.2-respond-1.1.0.min.js"></script>
    </head>
    <body>
        <header id="header">
            <div class="container">
                <div class="row">
                    <div class="span8">
                        <div id="title" class="pull-right">نرم افزار مدریت کرال</div>
                    </div>
                    <div class="span4">
                        <div id="logo" class="pull-left">
                            <h1>iFilm</h1>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <section id="main">
            <div class="container">
                <div class="row">
                    <div class="login-form modal">
                        <div class="modal-header">
                            <h2>ورود</h2>
                        </div>
                        <div class="modal-body">

                            <asp:Login ID="Login1" runat="server" MembershipProvider="MyMembershipProvider" DestinationPageUrl="~/index.html" RenderOuterTable="False" OnLoggingIn="Login1_LoggingIn">
                                <LayoutTemplate>
                                  
                                        <fieldset>
                                            <div class="clearfix"></div>
                                            <label for="username">نام کاربری</label>
                                            <asp:TextBox runat="server" ID="username" name="username" type="text" value="" onblur="" onfocus="" placeholder="نام کاربری"></asp:TextBox>

                                            <div class="clearfix"></div>
                                            <label for="password">رمز عبور</label>
                                            <asp:TextBox runat="server" TextMode="Password"  ID="password" name="password" type="password" value="" onblur="" onfocus="" placeholder="رمز عبور"></asp:TextBox>
                                            <div class="clearfix"></div>
                                            <asp:Button ID="LoginButton" runat="server" CommandName="Login" Text="ورود" ValidationGroup="Login1" CssClass="btn btn-primary pull-left" />
                                            <div class="clearfix"></div>
                                        </fieldset>
                                  
                                </LayoutTemplate>
                            </asp:Login>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <footer id="footer">
			
		</footer>
		<script src="js/jquery-1.9.1.min.js"></script>
		<script src="js/main.js"></script>
    </body>
    </html>
</form>
