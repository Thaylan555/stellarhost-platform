import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";

export default function EmailsAdmin() {
  const [emails, setEmails] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("emails").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) {
        console.error(error);
      } else {
        setEmails(data || []);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Envios de E-mail</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Para</th>
            <th>Template</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.to}</td>
              <td>{e.templateName}</td>
              <td>{e.status}</td>
              <td>{new Date(e.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
