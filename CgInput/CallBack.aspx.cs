using CgInput;
using CgInput.MyDBTableAdapters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace CallBack
{
    public partial class CallBack : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            Response.Headers.Remove("Server");
        }
        //[WebMethod]
        //public static string PollInserter(int OptionId)
        //{
        //    return "kefbckefbc";

        //}


        [WebMethod]
        [ScriptMethod(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public static string Crwal_Select(int Lang)
        {

            string RetStr = "";

            CgTableAdapter Cg_Ta = new CgTableAdapter();
            MyDB.CgDataTable Cg_Dt = Cg_Ta.Crawl_Select_Lang(short.Parse(Lang.ToString().Trim()));

           // {"d":{"success":"true","items":{"0":{"text":"title1","value":1},"1":{"text":"title2","value":2}}}}
            RetStr += "{\"success\":\"true\",\"items\":{";

            for (int i = 0; i < Cg_Dt.Rows.Count; i++)
            {
                RetStr += "\"" + i.ToString() + "\":" + "{\"text\":\"" + Cg_Dt[i]["Title"] + "\", \"value\":\"" + Cg_Dt[i]["id"] + "} ,";

            }
            RetStr = RetStr.Remove(RetStr.Length - 1, 1);

            RetStr += "}";


         


            return RetStr.ToString();
        }


        //[WebMethod]
        //[ScriptMethod(UseHttpGet = true, ResponseFormat = ResponseFormat.Json)]
        //public  void Crwal_Select(int IDNo)
        //{

        //    string JSONToReturn = "{\"success\":\"true\",\"items\":{\"0\":{\"text\":\"title1\",\"value\":1},\"1\":{\"text\":\"title2\",\"value\":2}}}";
        //    Response.Write(JSONToReturn);
        //   // Response.End;

        //}
        
    }
}