export function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

export function currentMonthStartIso() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}-01`;
}

export function currentMonthEndIso() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const lastDay = new Date(year, month, 0).getDate();

    return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}