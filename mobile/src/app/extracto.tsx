import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { obterConta, listarMovimentos, mostrarErro, type Conta, type Movimento } from '../lib/api';
import { sessao, useExigirSessao } from '../lib/sessao';
import { formatarMT, formatarData } from '../lib/formato';

function descricao(m: Movimento): string {
  if (m.tipo === 'DEPOSITO') return 'Depósito';
  return m.sentido === 'CREDITO'
    ? `Transferência recebida de ${m.contaOrigem}`
    : `Transferência enviada para ${m.contaDestino}`;
}

export default function ExtractoScreen() {

  useExigirSessao();

  const [conta, setConta] = useState<Conta | null>(null);
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aActualizar, setAActualizar] = useState(false);

  const carregar = useCallback(async () => {
    if (!sessao.token) return;
    try {
      const [c, m] = await Promise.all([obterConta(), listarMovimentos()]);
      setConta(c);
      setMovimentos(m);
    } catch (e) {
      mostrarErro(e, 'Não foi possível carregar o extracto');
    } finally {
      setCarregando(false);
      setAActualizar(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (

    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={aActualizar}
          onRefresh={() => { setAActualizar(true); carregar(); }}
        />
      }
    >

      <Text style={styles.logo}>BancoMobile</Text>

      <Text style={styles.titulo}>Extracto bancário</Text>

      <Text style={styles.descricao}>Movimentos da conta {sessao.numero}</Text>

      <View style={styles.cartao}>

        <Text style={styles.label}>Saldo disponível</Text>

        <Text style={styles.saldo}>
          {conta ? formatarMT(conta.saldo) : carregando ? '...' : 'Indisponível'}
        </Text>

      </View>

      <Text style={styles.subtitulo}>Movimentos recentes</Text>

      {carregando && <ActivityIndicator color="#15803D" style={{ marginVertical: 20 }} />}

      {!carregando && movimentos.length === 0 && (
        <Text style={styles.data}>Ainda não há movimentos nesta conta.</Text>
      )}

      {movimentos.map((movimento) => {
        const falhada = movimento.estado === 'FALHADA';
        const credito = movimento.sentido === 'CREDITO';
        return (
          <View key={movimento.referencia} style={styles.movimento}>

            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.nome}>
                {descricao(movimento)}{falhada ? ' (falhada)' : ''}
              </Text>
              <Text style={styles.data}>
                {formatarData(movimento.dataHora)}
                {falhada && movimento.motivoFalha ? ` · ${movimento.motivoFalha}` : ''}
              </Text>
            </View>

            <Text
              style={[
                styles.valor,
                falhada
                  ? { color: '#94A3B8', textDecorationLine: 'line-through' }
                  : credito ? styles.positivo : styles.negativo,
              ]}
            >
              {credito ? '+ ' : '- '}{formatarMT(movimento.valor)}
            </Text>

          </View>
        );
      })}

      <TouchableOpacity
        style={styles.botao}
        onPress={() => router.replace('/dashboard')}
      >
        <Text style={styles.textoBotao}>VOLTAR AO INÍCIO</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#F1F8F4',
padding: 25,
},
logo: {
color: '#14532D',
fontSize: 25,
fontWeight: 'bold',
textAlign: 'center',
marginTop: 35,
marginBottom: 30,
},
titulo: {
color: '#14532D',
fontSize: 26,
fontWeight: 'bold',
},
descricao: {
color: '#64748B',
marginTop: 8,
marginBottom: 25,
},
cartao: {
backgroundColor: '#14532D',
padding: 22,
borderRadius: 15,
marginBottom: 30,
},
label: {
color: '#D1FAE5',
fontSize: 14,
},
saldo: {
color: '#FFFFFF',
fontSize: 27,
fontWeight: 'bold',
marginTop: 10,
},
subtitulo: {
color: '#14532D',
fontSize: 19,
fontWeight: 'bold',
marginBottom: 15,
},
movimento: {
backgroundColor: '#FFFFFF',
padding: 17,
borderRadius: 10,
marginBottom: 12,
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
},
nome: {
color: '#14532D',
fontWeight: 'bold',
fontSize: 14,
},
data: {
color: '#94A3B8',
marginTop: 6,
fontSize: 12,
},
valor: {
fontWeight: 'bold',
fontSize: 14,
},
positivo: {
color: '#15803D',
},
negativo: {
color: '#DC2626',
},
botao: {
backgroundColor: '#15803D',
height: 55,
borderRadius: 10,
justifyContent: 'center',
alignItems: 'center',
marginTop: 20,
marginBottom: 35,
},
textoBotao: {
color: '#FFFFFF',
fontWeight: 'bold',
},
});
