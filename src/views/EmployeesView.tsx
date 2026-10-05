import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Employee, Role } from '../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  User,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  Lock
} from 'lucide-react';
import { formatPhone, getDigitCount } from '../utils/masks';

export const EmployeesView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, activeCompany } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('staff');
  const [position, setPosition] = useState('Atendente de Balcão');
  const [phone, setPhone] = useState('');
  const [active, setActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setName('');
    setEmail('');
    setRole('staff');
    setPosition('Atendente de Balcão');
    setPhone('');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setRole(emp.role || 'staff');
    setPosition(emp.position || emp.roleTitle || 'Atendente');
    setPhone(emp.phone);
    setActive(emp.active);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEmp) {
      updateEmployee(editingEmp.id, {
        name,
        email,
        role,
        position,
        phone,
        active
      });
    } else {
      addEmployee({
        name,
        email,
        role,
        position,
        phone,
        active
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Equipe & Funcionários</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gerencie os colaboradores da <strong>{activeCompany.tradeName}</strong> e seus níveis de acesso ao BebêAqui.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Funcionário</span>
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Nome do Colaborador</th>
                <th className="py-3.5 px-4">Cargo / Função</th>
                <th className="py-3.5 px-4">Permissão no BebêAqui</th>
                <th className="py-3.5 px-4">Telefone</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-xs">{emp.name}</div>
                    <div className="text-[11px] text-slate-400">{emp.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {emp.position}
                  </td>
                  <td className="py-3.5 px-4">
                    {emp.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Geral (R$ 180)</span>
                      </span>
                    ) : emp.role === 'admin_distribuidora' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Distribuidora (R$ 80)</span>
                      </span>
                    ) : emp.role === 'atacado_operator' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                        <span>📦</span>
                        <span>Operador Atacado (R$ 120)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                        <User className="w-3.5 h-3.5" />
                        <span>Funcionário Balcão</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    {emp.phone}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {emp.active ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                        Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Editar colaborador"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover ${emp.name} da equipe?`)) {
                            deleteEmployee(emp.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Remover colaborador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold">
                {editingEmp ? 'Editar Funcionário' : 'Novo Funcionário no BebêAqui'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lucas Ferreira"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">E-mail para Acesso *</label>
                <input
                  type="email"
                  required
                  placeholder="lucas@distribuidora.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Cargo / Função *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Garçom / Balconista"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Telefone / WhatsApp</span>
                    {phone && (
                      <span className="text-[10px] font-mono text-slate-400">{getDigitCount(phone)}/11</span>
                    )}
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={e => setPhone(formatPhone(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Nível de Permissão no Sistema</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="admin">Administrador Geral (Combo Distribuidora + Atacado - R$ 180)</option>
                  <option value="admin_distribuidora">Administrador Distribuidora (Exclusivo Distribuidora - R$ 80)</option>
                  <option value="atacado_operator">Operador de Atacado B2B (Exclusivo Atacado - R$ 120)</option>
                  <option value="staff">Funcionário de Balcão (Mesas, Comandas e PDV)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Colaborador Ativo</span>
              </label>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
