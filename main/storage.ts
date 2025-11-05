import Store from 'electron-store';

const store = new Store();

export const saveData = (key: string, value: any) => {
    //@ts-ignore
  store.set(key, value);
};

export const loadData = (key: string, defaultValue?: any) => {
    //@ts-ignore
  return store.get(key, defaultValue);
};

export const deleteData = (key: string) => {
    //@ts-ignore
  store.delete(key);
}