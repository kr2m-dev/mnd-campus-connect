import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSupplierStats = (supplierId?: string) => {
  return useQuery({
    queryKey: ["supplier-stats", supplierId],
    queryFn: async () => {
      if (!supplierId) return null;

      // Récupérer toutes les commandes du fournisseur
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("supplier_id", supplierId);

      if (ordersError) throw ordersError;

      // Récupérer les produits du fournisseur
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("supplier_id", supplierId);

      if (productsError) throw productsError;

      // Calculs des statistiques
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      // Revenus
      const totalRevenue = orders?.reduce((sum, order) =>
        sum + Number(order.total_amount), 0) || 0;

      const todayRevenue = orders
        ?.filter(order => new Date(order.created_at) >= today)
        .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      const monthRevenue = orders
        ?.filter(order => new Date(order.created_at) >= thisMonth)
        .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Commandes
      const totalOrders = orders?.length || 0;
      const todayOrders = orders?.filter(order =>
        new Date(order.created_at) >= today).length || 0;
      const monthOrders = orders?.filter(order =>
        new Date(order.created_at) >= thisMonth).length || 0;

      // Commandes par statut
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const confirmedOrders = orders?.filter(o => o.status === 'confirmed').length || 0;
      const preparingOrders = orders?.filter(o => o.status === 'preparing').length || 0;
      const readyOrders = orders?.filter(o => o.status === 'ready').length || 0;
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
      const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0;

      // Produits
      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter(p => p.is_active).length || 0;
      const lowStockProducts = products?.filter(p => p.stock_quantity < 10).length || 0;

      // Items vendus
      const totalItemsSold = orders?.reduce((sum, order) => {
        const orderItems = order.order_items?.reduce((itemSum: number, item: any) =>
          itemSum + item.quantity, 0) || 0;
        return sum + orderItems;
      }, 0) || 0;

      // Produits les plus vendus
      const productSales: { [key: string]: { name: string; quantity: number } } = {};
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = { name: item.product_name, quantity: 0 };
          }
          productSales[item.product_id].quantity += item.quantity;
        });
      });

      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Ventes des 7 derniers jours
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        return date;
      });

      const salesByDay = last7Days.map(date => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= date && orderDate < nextDay;
        }) || [];

        const revenue = dayOrders.reduce((sum, order) =>
          sum + Number(order.total_amount), 0);

        return {
          date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          revenue,
          orders: dayOrders.length,
        };
      });

      // Commandes récentes (5 dernières)
      const recentOrders = orders
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5) || [];

      return {
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
          month: monthRevenue,
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
          month: monthOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          preparing: preparingOrders,
          ready: readyOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts,
        },
        itemsSold: totalItemsSold,
        topProducts,
        salesByDay,
        recentOrders,
      };
    },
    enabled: !!supplierId,
  });
};
