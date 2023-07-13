using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace AspNetCoreCustomItemGallery.Models {
    public class TasksData {
        public static DataTable GetTasksData() {
            DataTable table = new DataTable();
            DataColumn id = new DataColumn("ID", typeof(int));
            DataColumn parentId = new DataColumn("ParentID", typeof(int));
            DataColumn text = new DataColumn("Text", typeof(string));
            DataColumn start = new DataColumn("StartDate", typeof(DateTime));
            DataColumn finish = new DataColumn("FinishDate", typeof(DateTime));
            table.Columns.AddRange(new DataColumn[] { id, parentId, text, start, finish });
            table.Rows.Add(new object[] { 1, 0, "Task 1", DateTime.Now, DateTime.Now.AddDays(1) });
            table.Rows.Add(new object[] { 2, 1, "Task 2", DateTime.Now.AddDays(1), DateTime.Now.AddDays(2) });
            table.Rows.Add(new object[] { 3, 1, "Task 3", DateTime.Now.AddDays(2), DateTime.Now.AddDays(3) });

            return table;
        }
    }
}
