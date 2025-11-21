import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "MyLoYau - 陶豬管理員",
    description: "MyLoYau - 陶豬管理員",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
