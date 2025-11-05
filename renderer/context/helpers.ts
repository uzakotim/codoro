export async function getData(key: string, defaultValue: any) {
  if (typeof window === 'undefined' || !window.electron) return defaultValue;
  return await window.electron.ipcRenderer.invoke('get-data', key, defaultValue);
}

export async function setData(key: string, value: any) {
  if (typeof window === 'undefined' || !window.electron) return;
  return await window.electron.ipcRenderer.invoke('set-data', key, value);
}

export async function deleteData(key: string) {
  if (typeof window === 'undefined' || !window.electron) return;
  return await window.electron.ipcRenderer.invoke('delete-data', key);
}
