// app/routes/list.tsx
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { prisma } from "~/db.server";

// Define the data type for loader data
interface LoaderData {
  respondents: { email: string; createdAt: string }[];
}

export const loader: LoaderFunction = async () => {
  const respondents = await prisma.respondent.findMany({
    select: {
      email: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" }, // Default to newest first
  });

  return json<LoaderData>({
    respondents: respondents.map((respondent) => ({
      email: respondent.email,
      createdAt: new Date(respondent.createdAt).toLocaleDateString(),
    })),
  });
};

export default function List() {
  const { respondents } = useLoaderData<LoaderData>();
  const [sortedRespondents, setSortedRespondents] = useState(respondents);
  const [isAscending, setIsAscending] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

  // Toggle sorting between oldest and newest
  const toggleSortOrder = () => {
    const sorted = [...respondents].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return isAscending ? dateB - dateA : dateA - dateB;
    });
    setSortedRespondents(sorted);
    setIsAscending(!isAscending);
  };

  // Export selected data as CSV
  const exportCSV = () => {
    const selectedRespondents = sortedRespondents.filter((row) =>
      selectedRows.includes(row.email)
    );

    const csvContent = [
      ["Email", "Created Date"],
      ...selectedRespondents.map((row) => [row.email, row.createdAt]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "selected_respondents.csv");
    link.click();
  };

  // Handle individual row selection
  const handleRowSelection = (email: string) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(email)
        ? prevSelected.filter((row) => row !== email)
        : [...prevSelected, email]
    );
  };

  // Handle "Select All" functionality
  const handleSelectAll = () => {
    if (isSelectAllChecked) {
      setSelectedRows([]); // Deselect all
    } else {
      setSelectedRows(sortedRespondents.map((respondent) => respondent.email)); // Select all
    }
    setIsSelectAllChecked(!isSelectAllChecked);
  };

  return (
    <div className="min-h-screen bg-black text-yellow-600 px-4 py-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Respondents List</h1>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={toggleSortOrder}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sort by {isAscending ? "Newest" : "Oldest"}
        </button>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Export as CSV
        </button>
      </div>
      <div className="w-full max-w-md overflow-x-auto">
        <table className="w-full border border-gray-700 bg-gray-800 text-left">
          <thead>
            <tr>
              <th className="p-2 border-b border-gray-700 text-yellow-600">
                <input
                  type="checkbox"
                  checked={isSelectAllChecked}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-2 border-b border-gray-700 text-yellow-600">Email</th>
              <th className="p-2 border-b border-gray-700 text-yellow-600">Created Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedRespondents.map((respondent, index) => (
              <tr key={index} className="even:bg-gray-700">
                <td className="p-2 border-b border-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(respondent.email)}
                    onChange={() => handleRowSelection(respondent.email)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2 border-b border-gray-700">{respondent.email}</td>
                <td className="p-2 border-b border-gray-700">{respondent.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
