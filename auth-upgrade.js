/*
  Estrutura base do upgrade de login e permissões do Sistema IV.
  Para ativar no index.html, adicionar antes de </body>:
  <script src="./auth-upgrade.js"></script>

  Observação: a implementação completa de autenticação deve usar Firebase Authentication
  ou regras de segurança no Firestore para proteção real no banco de dados.
*/

window.IV_PERMISSIONS = {
  dashboard: {
    'dashboard.view': 'Visualizar Dashboard'
  },
  alunos: {
    'alunos.view': 'Visualizar alunos',
    'alunos.create': 'Cadastrar aluno',
    'alunos.edit': 'Editar aluno',
    'alunos.delete': 'Excluir aluno',
    'alunos.import': 'Importar lista',
    'alunos.bulkDelete': 'Excluir selecionados',
    'alunos.advanceModule': 'Avançar módulo'
  },
  equipes: {
    'equipes.view': 'Visualizar equipes',
    'equipes.create': 'Cadastrar equipe',
    'equipes.edit': 'Editar equipe',
    'equipes.delete': 'Excluir equipe'
  },
  presenca: {
    'presenca.view': 'Visualizar presença',
    'presenca.edit': 'Marcar presença',
    'presenca.bulkMark': 'Marcar todos'
  },
  relatorios: {
    'relatorios.view': 'Visualizar relatórios',
    'relatorios.generate': 'Gerar relatório',
    'relatorios.share': 'Compartilhar relatório no WhatsApp'
  },
  backup: {
    'backup.export': 'Exportar backup JSON',
    'backup.import': 'Importar backup JSON'
  },
  usuarios: {
    'usuarios.view': 'Visualizar usuários',
    'usuarios.create': 'Cadastrar usuários',
    'usuarios.edit': 'Editar usuários',
    'usuarios.delete': 'Excluir usuários',
    'usuarios.permissions': 'Conceder permissões'
  }
};

window.IV_AUTH_UPGRADE = {
  administratorUsername: 'administrador',
  permissionGroups: window.IV_PERMISSIONS,
  status: 'base-loaded'
};

console.info('IV Auth Upgrade carregado. Permissões disponíveis:', window.IV_PERMISSIONS);
