import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBansosRole() {
  return useQuery({
    queryKey: ["bansos-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("bansos_user_roles").select("role").eq("user_id", user.id);
      return data?.[0]?.role ?? null;
    },
  });
}

export function useBansosStats() {
  return useQuery({
    queryKey: ["bansos-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("bansos_stats");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useBansosRecipients() {
  return useQuery({
    queryKey: ["bansos-recipients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bansos_recipients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBansosPrograms() {
  return useQuery({
    queryKey: ["bansos-programs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bansos_programs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBansosDistributions() {
  return useQuery({
    queryKey: ["bansos-distributions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bansos_distributions").select("*, bansos_recipients(full_name, nik), bansos_programs(name, category)").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBansosBlockchain() {
  return useQuery({
    queryKey: ["bansos-blockchain"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bansos_blockchain").select("*").order("block_index", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBansosChainVerify() {
  return useQuery({
    queryKey: ["bansos-chain-verify"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("bansos_verify_chain");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useBansosMyWallet() {
  return useQuery({
    queryKey: ["bansos-my-wallet"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("bansos_wallets")
        .select("*")
        .eq("owner_user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useBansosWallets() {
  return useQuery({
    queryKey: ["bansos-wallets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bansos_wallets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBansosTreasuryWallets() {
  return useQuery({
    queryKey: ["bansos-treasury-wallets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bansos_wallets")
        .select("*, bansos_programs!bansos_wallets_owner_program_id_fkey(name, category)")
        .eq("wallet_type", "treasury")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBansosWalletTxs(walletId: string | null | undefined) {
  return useQuery({
    queryKey: ["bansos-wallet-txs", walletId],
    enabled: !!walletId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bansos_wallet_transactions")
        .select("*")
        .or(`from_wallet_id.eq.${walletId},to_wallet_id.eq.${walletId}`)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBansosAllTxs() {
  return useQuery({
    queryKey: ["bansos-all-txs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bansos_wallet_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBansosMerchants() {
  return useQuery({
    queryKey: ["bansos-merchants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bansos_merchants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBansosTrack(query: string | null) {
  return useQuery({
    queryKey: ["bansos-track", query],
    enabled: !!query,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("bansos_public_track", { _query: query! });
      if (error) throw error;
      return data ?? [];
    },
  });
}
