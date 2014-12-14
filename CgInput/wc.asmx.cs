using CgInput.MyDBTableAdapters;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Script.Services;
using System.Web.Services;
using System.Security.Authentication;
using System.Web.Security;

namespace CgInput
{
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [ScriptService]
    [System.ComponentModel.ToolboxItem(false)]
    public class wc : System.Web.Services.WebService
    {
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
        public List<Crawls> Crwal_Select(int Lang)
        {
            List<Crawls> ListMessege = new List<Crawls>();
            CgTableAdapter Cg_Ta = new CgTableAdapter();
            MyDB.CgDataTable Cg_Dt = Cg_Ta.Crawl_Select_Lang(short.Parse(Lang.ToString().Trim()));
            for (int i = 0; i < Cg_Dt.Rows.Count; i++)
            {
                Crawls Mgs = new Crawls();
                Mgs.Text = Cg_Dt[i]["Title"].ToString();
                Mgs.Value = Cg_Dt[i]["Id"].ToString();

                ListMessege.Add(Mgs);
            }
            JavaScriptSerializer serializer = new JavaScriptSerializer(null);
            string json = serializer.Serialize(ListMessege);
            return ListMessege;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
        public List<Times> Time_Select()
        {
            List<Times> TimesLst = new List<Times>();

            CgTableAdapter Cg_Ta = new CgTableAdapter();
            MyDB.CgDataTable Cg_Dt = Cg_Ta.Times_SelectAll();
            for (int i = 0; i < Cg_Dt.Rows.Count; i++)
            {
                Times Tm = new Times();
                Tm.Title = Cg_Dt[i]["Title"].ToString();
                Tm.Id = Cg_Dt[i]["Id"].ToString();

                TimesLst.Add(Tm);
            }
            JavaScriptSerializer serializer = new JavaScriptSerializer(null);
            string json = serializer.Serialize(TimesLst);
            return TimesLst;
        }


        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
        public int Items_Insert(string Text, string Color, int Priority, int Crawl_Id, int Times_Id, int Year, int Month, int Day)
        {
            DateTime NDt = DateTime.Parse(Year.ToString() + "/" + Month.ToString() + "/" + Day.ToString() + "  00:00:00.000");
            CgTableAdapter Cg_Ta = new CgTableAdapter();
            MyDB.CgDataTable Cg_DtLatest=Cg_Ta.Items_select_NoDeleted(Crawl_Id, Times_Id, NDt);
            //2014-05-18
            //Replace Numbers
            Text = ReplaceNumbers(Text);
          //  int Pr = 0;
          ////  Priority = 0;
          //  if (Cg_DtLatest.Count > 1)
          //  {
          //     // Priority = int.Parse(Cg_DtLatest[Cg_DtLatest.Count - 1]["PRIORITY"].ToString());
          //  }
            Cg_Ta.Update_Priority_Next(Crawl_Id, Times_Id, NDt,Priority);

            int Id = int.Parse(Cg_Ta.Items_Insert(Text.Trim(), Priority, Crawl_Id, Times_Id, Color, NDt).ToString());

            JavaScriptSerializer serializer = new JavaScriptSerializer(null);
            string json = serializer.Serialize(Id);
            return Id;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
        public List<Items> Items_Select(int Crawl_Id, int Times_Id, int Year, int Month, int Day, string Deleted)
        {
            //string Us= User.Identity.Name;
            bool Del = bool.Parse(Deleted);
            DateTime NDt = DateTime.Parse(Year.ToString() + "/" + Month.ToString() + "/" + Day.ToString() + "  00:00:00.000");
            CgTableAdapter Cg_Ta = new CgTableAdapter();
            MyDB.CgDataTable Cg_Dt;
            if (Del)
            {
                Cg_Dt = Cg_Ta.Items_Select(Crawl_Id, Times_Id, NDt);
            }
            else
            {
                Cg_Dt = Cg_Ta.Items_select_NoDeleted(Crawl_Id, Times_Id, NDt);
            }

            List<Items> ItemsList = new List<Items>();
            for (int i = 0; i < Cg_Dt.Rows.Count; i++)
            {
                Items Itm = new Items();
                Itm.COLOR = Cg_Dt[i]["COLOR"].ToString();
                Itm.CRAWL_ID = int.Parse(Cg_Dt[i]["CRAWL_ID"].ToString());
                Itm.DATETIME = DateTime.Parse(Cg_Dt[i]["DATETIME"].ToString()).ToShortDateString();
                Itm.PRIORITY = int.Parse(Cg_Dt[i]["PRIORITY"].ToString());
                Itm.TEXT = Cg_Dt[i]["TEXT"].ToString();
                Itm.TIMES_ID = int.Parse(Cg_Dt[i]["TIMES_ID"].ToString());
                Itm.ROW = i + 1;
                Itm.ID = int.Parse(Cg_Dt[i]["ID"].ToString());
                Itm.DELETED = bool.Parse(Cg_Dt[i]["DELETED"].ToString());

                Itm.TEXT = ReplaceNumbers(Itm.TEXT);

                ItemsList.Add(Itm);
            }

            JavaScriptSerializer serializer = new JavaScriptSerializer(null);
            string json = serializer.Serialize(ItemsList);
            return ItemsList;
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
        public bool Items_Delete(int Id)
        {
            try
            {
                CgTableAdapter Cg_Ta = new CgTableAdapter();
                Cg_Ta.Update_Deleted(Id);
                return true;
            }
            catch
            {
                return false;
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
        public bool Items_Update(string Text, string Color, int Priority, int Id)
        {
            try
            {
                CgTableAdapter Cg_Ta = new CgTableAdapter();
                Text = ReplaceNumbers(Text);
                Cg_Ta.Items_Update(Text, Priority, Color, Id);
                return true;
            }
            catch
            {
                return false;
            }
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
        public bool Items_Copy(int Crawl_Id, int Times_Id, int Year, int Month, int Day, int DestCrawl_Id, int DestTimes_Id, int DestYear, int DestMonth, int DestDay,int DestLang)
        {
            DateTime NDt = DateTime.Parse(Year.ToString() + "/" + Month.ToString() + "/" + Day.ToString() + "  00:00:00.000");
            DateTime DestNDt = DateTime.Parse(DestYear.ToString() + "/" + DestMonth.ToString() + "/" + DestDay.ToString() + "  00:00:00.000");
            CgTableAdapter Cg_Ta = new CgTableAdapter();

            if (DestCrawl_Id == 0)
            {
                MyDB.CgDataTable Crls = Cg_Ta.Crawl_Select_Lang(short.Parse(DestLang.ToString()));
                for (int j = 0; j < Crls.Rows.Count; j++)
                {
                    Cg_Ta.Delete_allItems(int.Parse(Crls[j]["Id"].ToString()), DestTimes_Id, DestNDt);
                    MyDB.CgDataTable Cg_Dt = Cg_Ta.Items_select_NoDeleted(int.Parse(Crls[j]["Id"].ToString()), Times_Id, NDt);
                    for (int i = 0; i < Cg_Dt.Rows.Count; i++)
                    {
                        Cg_Ta.Items_Insert(Cg_Dt[i]["TEXT"].ToString(), int.Parse(Cg_Dt[i]["PRIORITY"].ToString()), int.Parse(Crls[j]["Id"].ToString()),
                            DestTimes_Id, Cg_Dt[i]["COLOR"].ToString(), DestNDt);
                    }
                }     
              
            }
            else
            {
                Cg_Ta.Delete_allItems(DestCrawl_Id, DestTimes_Id, DestNDt);

                MyDB.CgDataTable Cg_Dt = Cg_Ta.Items_select_NoDeleted(Crawl_Id, Times_Id, NDt);
                for (int i = 0; i < Cg_Dt.Rows.Count; i++)
                {
                    Cg_Ta.Items_Insert(Cg_Dt[i]["TEXT"].ToString(), int.Parse(Cg_Dt[i]["PRIORITY"].ToString()), DestCrawl_Id,
                        DestTimes_Id, Cg_Dt[i]["COLOR"].ToString(), DestNDt);
                }
            }
         
            return true;
        }
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
        public bool Items_Publish(int Times_Id, int Year, int Month, int Day,short LangId)
        {
            
                DateTime NDt = DateTime.Parse(Year.ToString() + "/" + Month.ToString() + "/" + Day.ToString() + "  00:00:00.000");
                CgTableAdapter Cg_Ta = new CgTableAdapter();

                MyDB.CgDataTable crwals_Dt = Cg_Ta.Crawls_SelectAll(LangId);
                
                if (crwals_Dt.Count>0)
                {
                    Cg_Ta.Publish_Log_insert(NDt, User.Identity.Name, Times_Id,int.Parse(crwals_Dt[0]["Lang"].ToString()));
                }
              
                for (int i = 0; i < crwals_Dt.Rows.Count; i++)
                {
                    MyDB.CgDataTable Times_Dt = Cg_Ta.Times_SelectById(Times_Id);
                    string DirDate = DateConversion.GD2JD(NDt).Replace("/", "-");
                    string DirHour = Times_Dt[0]["Title"].ToString().Replace(":", "-");
                    string Lang = "Arabic";
                    if (crwals_Dt[i]["Lang"].ToString() == "1")
                    {
                        Lang = "Farsi";
                    }

                    DirectoryInfo CrDr = new DirectoryInfo(ConfigurationManager.AppSettings["FilesPath"].ToString() + Lang + "\\" + DirDate + "\\" + DirHour + "\\");
                    if (!CrDr.Exists)
                    {
                        CrDr.Create();
                    }
                    string FileName = CrDr + "\\" + crwals_Dt[i]["FILENAME"].ToString() + ".txt";

                    FileStream Fst = null;
                    
                        Fst = File.Create(FileName);
                        Fst.Close();
                    
                      
                   


                    StreamWriter Sw = new StreamWriter(FileName, false, System.Text.Encoding.UTF8);


                    MyDB.CgDataTable Cg_Dt = Cg_Ta.Items_select_NoDeleted(int.Parse(crwals_Dt[i]["id"].ToString()), Times_Id, NDt);

                    List<Items> ItemsList = new List<Items>();
                    for (int j = 0; j < Cg_Dt.Rows.Count; j++)
                    {
                        Items Itm = new Items();
                        Itm.COLOR = Cg_Dt[j]["COLOR"].ToString();
                        Itm.CRAWL_ID = int.Parse(Cg_Dt[j]["CRAWL_ID"].ToString());
                        Itm.DATETIME = DateTime.Parse(Cg_Dt[j]["DATETIME"].ToString()).ToShortDateString();
                        Itm.PRIORITY = int.Parse(Cg_Dt[j]["PRIORITY"].ToString());
                        Itm.TEXT =  Cg_Dt[j]["TEXT"].ToString().Trim();
                        Itm.TIMES_ID = int.Parse(Cg_Dt[j]["TIMES_ID"].ToString());
                        Itm.ROW = j + 1;
                        Itm.ID = int.Parse(Cg_Dt[j]["ID"].ToString());
                        //2014-05-18
                        //Replace Numbers
                        if (crwals_Dt[i]["Lang"].ToString() == "1")
                        {
                            Itm.TEXT = ReplaceNumbers(Itm.TEXT);
                        }
                        else
                        {
                            //2014-08-19
                            //Replace Numbers For Arabic Lang With Eng Numbers.
                            Itm.TEXT = ReStoreNumbers(Itm.TEXT);
                        }

                        ItemsList.Add(Itm);

                        if (Itm.TEXT.Trim().Length > 0)
                        {
                            if (Itm.TEXT.Trim() != "^^")
                            {
                                Sw.Write("<color " + Itm.COLOR + ">" + Itm.TEXT.Replace("$$", "\"").Trim() + "</color>");
                            }
                            else
                            {
                                Sw.WriteLine("\r\n");
                            }
                        }
                        //else
                        //{
                        //    Sw.WriteLine(Itm.TEXT.Replace("$$", "\""));
                        //}

                        //if (Itm.TEXT != "\r\n")
                        //{
                        //    Sw.Write("<color " + Itm.COLOR + ">" + Itm.TEXT.Replace("$$", "\"").Trim() + "</color>");
                        //}
                        //else
                        //{
                        //    Sw.WriteLine("99999");
                        //    Sw.WriteLine(Itm.TEXT.Replace("$$", "\""));
                        //}
                    }
                    Sw.Close();

                }
                return true;
           
        }
       


        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
        public bool Delete_All(int Crawl_Id, int Times_Id, int Year, int Month, int Day)
        {
            try
            {
                DateTime NDt = DateTime.Parse(Year.ToString() + "/" + Month.ToString() + "/" + Day.ToString() + "  00:00:00.000");
                CgTableAdapter Cg_Ta = new CgTableAdapter();

                Cg_Ta.Delete_allItems(Crawl_Id, Times_Id, NDt);
                return true;
            }
            catch
            {
                return false;
            }

        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
        public Publish Get_Info(int Times_Id, int Year, int Month, int Day,int LangId)
        {
             

            DateTime NDt = DateTime.Parse(Year.ToString() + "/" + Month.ToString() + "/" + Day.ToString() + "  00:00:00.000");
            CgTableAdapter Cg_Ta = new CgTableAdapter();

            MyDB.CgDataTable Dt = Cg_Ta.PublishLogSelectTop(Times_Id, NDt,LangId);
            Publish Pb = new Publish();

            MyDB.CgDataTable crwals_Dt = Cg_Ta.Crawls_SelectAll(short.Parse(LangId.ToString()));
            double Time = 0;
            double Count = 0;
            //if (crwals_Dt.Count > 0)
            //{
            //    Cg_Ta.Publish_Log_insert(NDt, User.Identity.Name, Times_Id, int.Parse(crwals_Dt[0]["Lang"].ToString()));
            //}

            for (int i = 0; i < crwals_Dt.Rows.Count; i++)
            {

                  MyDB.CgDataTable Cg_Dt = Cg_Ta.Items_select_NoDeleted(int.Parse(crwals_Dt[i]["id"].ToString()), Times_Id, NDt);

                    List<Items> ItemsList = new List<Items>();
                    for (int j = 0; j < Cg_Dt.Rows.Count; j++)
                    {
                        Count += Cg_Dt[j]["TEXT"].ToString().Length;
                       
                    }

               
            }

            DateTime NDtChk = DateTime.Parse(Year.ToString() + "/" + Month.ToString() + "/" + Day.ToString() + " "  +Cg_Ta.Time_SelectById(Times_Id)[0]["TITLE"].ToString()+":00.000");
            if (NDtChk.AddMinutes(15) < DateTime.Now)
            {
                Pb.LOCK = true;
            }
            else
            {
                Pb.LOCK = false;
            }
            Time = Math.Floor(((Count / 50) * 6));
            Pb.TIME = Time.ToString();
            if (Dt.Rows.Count > 0)
            {
                Pb.DATETIME = Dt[0]["PublishDate"].ToString();
                Pb.USERNAME = Dt[0]["UserName"].ToString();
            }
            else
            {
                Pb.DATETIME = "-------";
                Pb.USERNAME = "-------";
            }
            return Pb;

        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json, UseHttpGet = false)]
        public bool IsUserArabic()
        {
            return Roles.IsUserInRole(User.Identity.Name, "Farsi");
          
        }


        public string ReplaceNumbers(string Str)
        {
            Str = Str.Replace("1", "۱");
            Str = Str.Replace("2", "۲");
            Str = Str.Replace("3", "۳");
            Str = Str.Replace("4", "۴");
            Str = Str.Replace("5", "۵");
            Str = Str.Replace("6", "۶");
            Str = Str.Replace("7", "۷");
            Str = Str.Replace("8", "۸");
            Str = Str.Replace("9", "۹");
            Str = Str.Replace("0", "۰");
            return Str;
        }
        public string ReStoreNumbers(string Str)
        {
            Str = Str.Replace("۱","1");
            Str = Str.Replace("۲","2");
            Str = Str.Replace("۳","3");
            Str = Str.Replace("۴","4");
            Str = Str.Replace("۵","5");
            Str = Str.Replace("۶","6");
            Str = Str.Replace("۷","7");
            Str = Str.Replace("۸","8");
            Str = Str.Replace("۹","9");
            Str = Str.Replace("۰","0");
            return Str;
        }

    }
    public class Crawls
    {
        public string Text { get; set; }
        public string Value { get; set; }
    }

    public class Publish
    {
        public string USERNAME { get; set; }
        public string DATETIME { get; set; }
        public string TIME { get; set; }
        public bool LOCK { get; set; }
    }
    public class Times
    {
        public string Title { get; set; }
        public string Id { get; set; }
    }
    public class Items
    {
        public string TEXT { get; set; }
        public string COLOR { get; set; }
        public int PRIORITY { get; set; }
        public int CRAWL_ID { get; set; }
        public int TIMES_ID { get; set; }
        public string DATETIME { get; set; }
        public int ROW { get; set; }
        public int ID { get; set; }
        public bool DELETED { get; set; }
    }
}
