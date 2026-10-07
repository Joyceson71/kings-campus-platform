import { NextResponse } from "next/server";

export async function GET() {
  const csv = [
    "department,attendance,assignments_submitted,test_average,resource_downloads",
    "CSE,94,812,86,2490",
    "AI&DS,91,644,84,1880",
    "ECE,87,591,79,1532",
    "MECH,82,438,76,990"
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=kings-campus-report.csv"
    }
  });
}
