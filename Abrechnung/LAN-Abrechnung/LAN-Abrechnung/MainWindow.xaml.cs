using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Microsoft.SqlServer.Server;
using Npgsql;
using System.Globalization;


namespace LAN_Abrechnung
{
    /// <summary>
    /// Interaktionslogik für MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private DataSet ds = new DataSet();
        private DataTable dt = new DataTable();


        public MainWindow()
        {
            InitializeComponent();

            
        }

        


        private void Button_OpenInvoice_OnClick(object sender, RoutedEventArgs e)
        {
            var InvoiceWindows = new Invoice();
            InvoiceWindows.Show();
        }

        public static DataSet GetData(string command)
        {
            var connString =
                "Server = db.geozukunft.at;Port = 6969;User Id = herbert;Password = herbert;Database = lan;";

            IDbConnection dbConnection = new NpgsqlConnection(connString);
            IDbCommand selectCommand = dbConnection.CreateCommand();
            selectCommand.CommandText = command;
            IDbDataAdapter dbDataAdapter = new NpgsqlDataAdapter();
            dbDataAdapter.SelectCommand = selectCommand;

            DataSet Dset = new DataSet();

            dbDataAdapter.Fill(Dset);



            return Dset;
        }
    }
}

    
