// app/routes/list.tsx
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
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
      selectedRows.includes(row.email),
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
        : [...prevSelected, email],
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
    <div className="flex min-h-screen flex-col items-center bg-black px-4 py-8 text-yellow-600">
      <h1 className="mb-4 text-2xl font-bold">Respondents List</h1>
      <div className="mb-4 flex space-x-4">
        <button
          onClick={toggleSortOrder}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Sort by {isAscending ? "Newest" : "Oldest"}
        </button>
        <button
          onClick={exportCSV}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Export as CSV
        </button>
      </div>
      <div className="w-full max-w-md overflow-x-auto">
        <table className="w-full border border-gray-700 bg-gray-800 text-left">
          <thead>
            <tr>
              <th className="border-b border-gray-700 p-2 text-yellow-600">
                <input
                  type="checkbox"
                  checked={isSelectAllChecked}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="border-b border-gray-700 p-2 text-yellow-600">
                Email
              </th>
              <th className="border-b border-gray-700 p-2 text-yellow-600">
                Created Date
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRespondents.map((respondent, index) => (
              <tr key={index} className="even:bg-gray-700">
                <td className="border-b border-gray-700 p-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(respondent.email)}
                    onChange={() => handleRowSelection(respondent.email)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="border-b border-gray-700 p-2">
                  {respondent.email}
                </td>
                <td className="border-b border-gray-700 p-2">
                  {respondent.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="w-full border-t border-gray-700 py-4 text-center text-gray-800">
        <p className="text-sm">&copy; {new Date().getFullYear()} </p>
        {/* <Link to="/logout" className="mt-1 block text-gray-800 underline">
          Logout
        </Link> */}
        <Form action="/logout" method="post">
          <button type="submit">Log out</button>
        </Form>
      </footer>
    </div>
  );
}
