export const excelParserWorkerCode = `
  self.onmessage = async function(e) {
    const { arrayBuffer, xlsxScriptUrl } = e.data;
    try {
      // Import SheetJS via the absolute URL passed from the main thread.
      // Blob workers have no origin, so relative paths like "/lib/..." are invalid —
      // the caller supplies the fully-qualified URL built from window.location.origin.
      importScripts(xlsxScriptUrl);

      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Parse to raw array matrix format to optimize memory structure transmission
      const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (parsedData.length === 0) {
        self.postMessage({ error: "Empty worksheet data found." });
        return;
      }

      const headers = parsedData[0];
      const rows = parsedData.slice(1);

      self.postMessage({ headers, rows });
    } catch (err) {
      self.postMessage({ error: "File parsing failed inside worker: " + err.message });
    }
  };
`;

