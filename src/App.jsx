import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  LayoutDashboard,
  Briefcase,
  Wallet,
  Truck,
  Warehouse,
  Wrench,
  Users,
  Handshake,
  Shield,
  Settings,
  LineChart,
  LogOut,
  FileText,
  CheckCircle2,
  Edit3,
  Eye,
  ArrowDownRight,
  FileSpreadsheet,
  Check,
  MoreVertical,
  Printer,
  Upload,
  Download,
  Trash2,
  CheckSquare,
  Square,
  Calculator,
  Bell,
  Filter,
  KeyRound,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from './supabase';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('1');
  const [password, setPassword] = useState('1');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [openDropdown, setOpenDropdown] = useState(null);

  // حالة نافذة تغيير كلمة المرور
  const [passwordForm, setPasswordForm] = useState({
    currentPass: '',
    newPass: '',
    confirmPass: '',
  });

  const [selectedRows, setSelectedRows] = useState({});
  const [selectedProjectForDetails, setSelectedProjectForDetails] =
    useState(null);
  const [selectedProjectForBudget, setSelectedProjectForBudget] = useState('');

  // فلاتر نافذة تفاصيل المشروع
  const [projFilterStart, setProjFilterStart] = useState('');
  const [projFilterEnd, setProjFilterEnd] = useState('');
  const [projFilterDesc, setProjFilterDesc] = useState('');
  const [projFilterCreator, setProjFilterCreator] = useState('');

  // فلاتر كشف حساب العهدة
  const [custodyFilterStart, setCustodyFilterStart] = useState('');
  const [custodyFilterEnd, setCustodyFilterEnd] = useState('');
  const [custodyFilterParty, setCustodyFilterParty] = useState('');

  // فلاتر شاشة الحسابات والمالية
  const [financeFilterStart, setFinanceFilterStart] = useState('');
  const [financeFilterEnd, setFinanceFilterEnd] = useState('');
  const [financeFilterProject, setFinanceFilterProject] = useState('');
  const [financeFilterCreator, setFinanceFilterCreator] = useState('');

  // نموذج إضافة حركة سريعة للمشروع
  const [quickProjTx, setQuickProjTx] = useState({
    desc: '',
    amount: '',
    partyType: 'general',
    partyName: '',
  });

  // البيانات مع الاسترجاع والحفظ التلقائي لمنع فقدان البيانات تماماً عند التحديث
  const [projectsList, setProjectsList] = useState(() => {
    const saved = localStorage.getItem('qasem_projects');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'مشروع مصنع الميثانول', client: 'شركة قاسم', budget: 15000000, progress: 10, status: 'قيد التنفيذ' },
      { id: 2, name: 'مشروع مستشفي الأمومة والطفولة', client: 'وزارة الصحة', budget: 25000000, progress: 20, status: 'قيد التنفيذ' },
      { id: 3, name: 'مشروع مستشفي التوفيقية', client: 'القطاع الخاص', budget: 18000000, progress: 15, status: 'قيد التنفيذ' },
      { id: 4, name: 'مشروع مستشفى الجامعة', client: 'جامعة القاهرة', budget: 30000000, progress: 5, status: 'قيد التنفيذ' },
      { id: 5, name: 'مشروع معهد الأورام', client: 'هيئة الأورام', budget: 35000000, progress: 8, status: 'قيد التنفيذ' },
    ];
  });

  const [transactionsList, setTransactionsList] = useState(() => {
    const saved = localStorage.getItem('qasem_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 1, desc: 'دفعة مقدمة من المالك', project: 'مشروع مصنع الميثانول', type: 'قبض', amount: 3000000, date: '2026-06-01', created_by: 'مدير النظام الأساسي', party_type: 'general', party_name: 'المالك' },
    ];
  });

  const [suppliersList, setSuppliersList] = useState(() => {
    const saved = localStorage.getItem('qasem_suppliers');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'الصعيدي', spec: 'حديد وأسمنت', phone: '01011112222', purchases: 1500000, due: 500000 },
      { id: 2, name: 'كراوية', spec: 'طوب', phone: '01022223333', purchases: 400000, due: 100000 },
      { id: 3, name: 'الجميل', spec: 'سباكة', phone: '01033334444', purchases: 250000, due: 75000 },
      { id: 4, name: 'محمد قاسم', spec: 'دهانات', phone: '01044445555', purchases: 150000, due: 30000 },
    ];
  });

  const [custodyList, setCustodyList] = useState(() => {
    const saved = localStorage.getItem('qasem_custody');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'طنطاوي', project: 'مشروع مصنع الميثانول', amount: 100000, spent: 0 },
      { id: 2, name: 'أحمد القاضي', project: 'مشروع مستشفي الأمومة والطفولة', amount: 100000, spent: 0 },
    ];
  });

  const [custodyTransactionsList, setCustodyTransactionsList] = useState(() => {
    const saved = localStorage.getItem('qasem_custody_tx');
    return saved ? JSON.parse(saved) : [
      { id: 1, custody_name: 'طنطاوي', type: 'expense', desc: 'شراء أدوات صيانة', amount: 5000, party_type: 'general', party_name: '', status: 'معتمد', date: '2026-06-05', created_by: 'طنطاوي' },
    ];
  });

  const [inventoryList, setInventoryList] = useState(() => {
    const saved = localStorage.getItem('qasem_inventory');
    return saved ? JSON.parse(saved) : [
      { id: 1, code: 'INV-101', name: 'حديد تسليح 16مم', location: 'مستودع دمياط', qty: 140, unit: 'طن' },
      { id: 2, code: 'INV-102', name: 'أسمنت بورتلاندي', location: 'مستودع دمياط', qty: 2500, unit: 'كيس' },
    ];
  });

  const [equipmentList, setEquipmentList] = useState(() => {
    const saved = localStorage.getItem('qasem_equipment');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'حفار هيدروليكي كتربلر 320', site: 'مشروع مصنع الميثانول', status: 'يعمل بالموقع' },
      { id: 2, name: 'رافعة برجية (Tower Crane)', site: 'مشروع مستشفي الأمومة والطفولة', status: 'يعمل بالموقع' },
    ];
  });

  const [employeesList, setEmployeesList] = useState(() => {
    const saved = localStorage.getItem('qasem_employees');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'طنطاوي', role: 'مهندس موقع', project: 'مشروع مصنع الميثانول', salary: 12000 },
      { id: 2, name: 'أحمد القاضي', role: 'مهندس موقع', project: 'مشروع مستشفي الأمومة والطفولة', salary: 12000 },
      { id: 3, name: 'حسام لاشين', role: 'مهندس موقع', project: 'مشروع مستشفي التوفيقية', salary: 11000 },
      { id: 4, name: 'خيري', role: 'عامل عادي', project: 'مشروع مصنع الميثانول', salary: 4500 },
      { id: 5, name: 'بشير', role: 'عامل عادي', project: 'مشروع مستشفي الأمومة والطفولة', salary: 4500 },
      { id: 6, name: 'حمدي', role: 'عامل عادي', project: 'مشروع مستشفي التوفيقية', salary: 4500 },
    ];
  });

  const [subcontractorsList, setSubcontractorsList] = useState(() => {
    const saved = localStorage.getItem('qasem_subcontractors');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'عوض', spec: 'سقالات', project: 'عام / غير مرتبطة', contract: 250000, current: 0 },
      { id: 2, name: 'وائل معوض', spec: 'محارة', project: 'مشروع مستشفي الأمومة والطفولة', contract: 300000, current: 0 },
      { id: 3, name: 'محمد سمير', spec: 'نقاش', project: 'مشروع مستشفي التوفيقية', contract: 180000, current: 0 },
      { id: 4, name: 'الكومي', spec: 'سباك', project: 'مشروع مصنع الميثانول', contract: 220000, current: 0 },
    ];
  });

  const [projectBudgetItems, setProjectBudgetItems] = useState(() => {
    const saved = localStorage.getItem('qasem_budget');
    return saved ? JSON.parse(saved) : [
      { id: 1, project: 'مشروع مصنع الميثانول', itemCode: 'B-01', itemName: 'أعمال الحفر والردم', estimatedCost: 1000000, actualCost: 950000 },
    ];
  });

  // الحفظ التلقائي والفوري في localStorage
  useEffect(() => {
    localStorage.setItem('qasem_projects', JSON.stringify(projectsList));
  }, [projectsList]);

  useEffect(() => {
    localStorage.setItem('qasem_transactions', JSON.stringify(transactionsList));
  }, [transactionsList]);

  useEffect(() => {
    localStorage.setItem('qasem_suppliers', JSON.stringify(suppliersList));
  }, [suppliersList]);

  useEffect(() => {
    localStorage.setItem('qasem_custody', JSON.stringify(custodyList));
  }, [custodyList]);

  useEffect(() => {
    localStorage.setItem('qasem_custody_tx', JSON.stringify(custodyTransactionsList));
  }, [custodyTransactionsList]);

  useEffect(() => {
    localStorage.setItem('qasem_inventory', JSON.stringify(inventoryList));
  }, [inventoryList]);

  useEffect(() => {
    localStorage.setItem('qasem_equipment', JSON.stringify(equipmentList));
  }, [equipmentList]);

  useEffect(() => {
    localStorage.setItem('qasem_employees', JSON.stringify(employeesList));
  }, [employeesList]);

  useEffect(() => {
    localStorage.setItem('qasem_subcontractors', JSON.stringify(subcontractorsList));
  }, [subcontractorsList]);

  useEffect(() => {
    localStorage.setItem('qasem_budget', JSON.stringify(projectBudgetItems));
  }, [projectBudgetItems]);

  const defaultPermissions = {
    projects: { view: true, edit: true, delete: false },
    finance: { view: true, edit: true, delete: false },
    suppliers: { view: true, edit: true, delete: false },
    subcontractors: { view: true, edit: true, delete: false },
    custody: {
      view: true,
      edit: true,
      delete: false,
      allocate: true,
      approve: true,
    },
    inventory: { view: true, edit: true, delete: false },
    equipment: { view: true, edit: true, delete: false },
    hr: { view: true, edit: false, delete: false },
    reports: { view: true, edit: false, delete: false },
    users: { view: false, edit: false, delete: false },
    settings: { view: false, edit: false, delete: false },
    budget: { view: true, edit: true, delete: false },
    allowedProjects: [],
  };

  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('qasem_users');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: 'مدير النظام الأساسي',
        username: '1',
        password: '1',
        role: 'مشرف عام (Admin)',
        permissions: {
          ...JSON.parse(JSON.stringify(defaultPermissions)),
          users: { view: true, edit: true, delete: true },
          settings: { view: true, edit: true, delete: true },
          allowedProjects: [],
        },
      },
      {
        id: 2,
        name: 'طنطاوي',
        username: '2',
        password: '2',
        role: 'مدير مشروع',
        permissions: {
          ...defaultPermissions,
          custody: {
            view: true,
            edit: true,
            delete: false,
            allocate: true,
            approve: false,
          },
          allowedProjects: ['مشروع مصنع الميثانول'],
        },
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('qasem_users', JSON.stringify(usersList));
  }, [usersList]);

  const [companySettings, setCompanySettings] = useState({
    companyName: 'شركة قاسم للمقاولات',
    cr: '1010987654',
    vatNo: '300123456700003',
    phone: '01000000000',
    email: 'info@qasem-contracting.com',
    address: 'دمياط - كفر سعد',
    currency: 'ج.م',
    vatRate: 14,
    moduleColors: {
      projects: 'bg-blue-600',
      finance: 'bg-emerald-600',
      suppliers: 'bg-teal-600',
      subcontractors: 'bg-purple-600',
      custody: 'bg-rose-600',
      inventory: 'bg-amber-600',
      equipment: 'bg-cyan-600',
      hr: 'bg-indigo-600',
      budget: 'bg-sky-600',
      users: 'bg-slate-700',
      settings: 'bg-zinc-700',
      reports: 'bg-violet-600',
    },
  });

  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    budget: '',
    progress: 0,
    status: 'قيد التنفيذ',
  });
  const [newTransaction, setNewTransaction] = useState({
    desc: '',
    project: '',
    type: 'صرف',
    amount: '',
    party_type: 'general',
    party_name: '',
  });
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    spec: '',
    phone: '',
    purchases: '',
    due: '',
  });
  const [newCustody, setNewCustody] = useState({
    name: '',
    project: '',
    amount: '',
    spent: 0,
  });
  const [newCustodyExpense, setNewCustodyExpense] = useState({
    custodyId: '',
    desc: '',
    amount: '',
    partyType: 'general',
    partyName: '',
  });
  const [newBudgetItem, setNewBudgetItem] = useState({
    project: '',
    itemCode: '',
    itemName: '',
    estimatedCost: '',
    actualCost: '',
  });

  const [newInventory, setNewInventory] = useState({ name: '', location: '', qty: '', unit: '' });
  const [newEquipment, setNewEquipment] = useState({ name: '', site: '', status: 'يعمل بالموقع' });
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', project: '', salary: '' });
  const [newSubcontractor, setNewSubcontractor] = useState({ name: '', spec: '', project: '', contract: '' });

  const [selectedCustodyForReport, setSelectedCustodyForReport] =
    useState(null);
  const [
    selectedPartyForAccountStatement,
    setSelectedPartyForAccountStatement,
  ] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editingSubcontractor, setEditingSubcontractor] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: 'مدير مشروع',
    permissions: JSON.parse(JSON.stringify(defaultPermissions)),
  });

  const getAccessibleProjects = () => {
    if (!currentUser || currentUser.username === '1') return projectsList;
    const allowed = currentUser.permissions?.allowedProjects || [];
    if (!allowed || allowed.length === 0) return projectsList;
    return projectsList.filter((p) => allowed.includes(p.name));
  };

  const accessibleProjects = getAccessibleProjects();
  const getMyPendingExpenses = () => {
    const pending = custodyTransactionsList.filter(
      (tx) => tx.status === 'معلق'
    );
    if (currentUser?.username === '1') return pending;
    return pending.filter((tx) => tx.created_by === currentUser?.name);
  };
  const myPendingExpenses = getMyPendingExpenses();

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const found = usersList.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
      setLoginError('');
      showToast(`مرحباً بك يا ${found.name} (${found.role})`, 'success');
    } else {
      setLoginError('❌ بيانات الدخول غير صحيحة. جرب (1/1)');
    }
  };

  // تغيير كلمة المرور للمستخدم الحالي
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.currentPass !== currentUser.password) {
      showToast('كلمة المرور الحالية غير صحيحة', 'error');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      showToast('كلمة المرور الجديدة غير مطابقة لتأكيد كلمة المرور', 'error');
      return;
    }
    if (!passwordForm.newPass) {
      showToast('الرجاء إدخال كلمة المرور الجديدة', 'error');
      return;
    }

    const updatedUsers = usersList.map((u) => {
      if (u.id === currentUser.id) {
        return { ...u, password: passwordForm.newPass };
      }
      return u;
    });

    setUsersList(updatedUsers);
    setCurrentUser({ ...currentUser, password: passwordForm.newPass });
    setActiveModal(null);
    setPasswordForm({ currentPass: '', newPass: '', confirmPass: '' });
    showToast('تم تغيير كلمة المرور بنجاح');
  };

  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(
      workbook,
      `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    showToast('تم التصدير بنجاح');
  };

  const handlePrintSection = (title) => {
    window.print();
    showToast(`جاري طباعة تقرير: ${title}`);
  };

  const toggleRowSelection = (moduleKey, id) => {
    setSelectedRows((prev) => {
      const current = prev[moduleKey] || [];
      const updated = current.includes(id)
        ? current.filter((rowId) => rowId !== id)
        : [...current, id];
      return { ...prev, [moduleKey]: updated };
    });
  };

  const handleDeleteSelectedRecords = (moduleKey) => {
    const selected = selectedRows[moduleKey] || [];
    if (selected.length === 0) {
      showToast('الرجاء تحديد سجل واحد على الأقل للحذف', 'error');
      return;
    }
    if (
      !window.confirm(`هل أنت متأكد من حذف ${selected.length} سجلات المحددة؟`)
    )
      return;

    if (moduleKey === 'projects')
      setProjectsList(
        projectsList.filter((item) => !selected.includes(item.id))
      );
    if (moduleKey === 'suppliers')
      setSuppliersList(
        suppliersList.filter((item) => !selected.includes(item.id))
      );
    if (moduleKey === 'subcontractors')
      setSubcontractorsList(
        subcontractorsList.filter((item) => !selected.includes(item.id))
      );
    if (moduleKey === 'inventory')
      setInventoryList(
        inventoryList.filter((item) => !selected.includes(item.id))
      );
    if (moduleKey === 'employees')
      setEmployeesList(
        employeesList.filter((item) => !selected.includes(item.id))
      );
    if (moduleKey === 'equipment')
      setEquipmentList(
        equipmentList.filter((item) => !selected.includes(item.id))
      );
    if (moduleKey === 'finance')
      setTransactionsList(
        transactionsList.filter((item) => !selected.includes(item.id))
      );
    if (moduleKey === 'budget')
      setProjectBudgetItems(
        projectBudgetItems.filter((item) => !selected.includes(item.id))
      );

    setSelectedRows((prev) => ({ ...prev, [moduleKey]: [] }));
    showToast('تم حذف السجلات المحددة بنجاح');
  };

  const handleImportExcel = (e, moduleName) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      if (data && data.length > 0) {
        if (moduleName === 'projects')
          setProjectsList((prev) => [...data, ...prev]);
        else if (moduleName === 'suppliers')
          setSuppliersList((prev) => [...data, ...prev]);
        else if (moduleName === 'subcontractors')
          setSubcontractorsList((prev) => [...data, ...prev]);
        else if (moduleName === 'inventory')
          setInventoryList((prev) => [...data, ...prev]);
        else if (moduleName === 'employees')
          setEmployeesList((prev) => [...data, ...prev]);
        else if (moduleName === 'equipment')
          setEquipmentList((prev) => [...data, ...prev]);
        else if (moduleName === 'finance')
          setTransactionsList((prev) => [...data, ...prev]);
        else if (moduleName === 'budget')
          setProjectBudgetItems((prev) => [...data, ...prev]);
        showToast(`تم استيراد ${data.length} سجل بنجاح!`);
      } else {
        showToast('الملف فارغ أو غير متوافق', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const renderModuleDropdownMenu = (moduleKey, dataList, title) => {
    const isOpen = openDropdown === moduleKey;
    const countSelected = (selectedRows[moduleKey] || []).length;
    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : moduleKey)}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition border"
        >
          <MoreVertical className="w-4 h-4" />
          <span>خيارات {countSelected > 0 ? `(${countSelected})` : ''}</span>
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border py-2 z-30 text-xs">
            <label className="w-full px-4 py-2 text-right hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer font-medium">
              <Upload className="w-4 h-4 text-blue-600" /> استيراد سجل (Excel)
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  handleImportExcel(e, moduleKey);
                  setOpenDropdown(null);
                }}
              />
            </label>
            <button
              onClick={() => {
                exportToExcel(dataList, title);
                setOpenDropdown(null);
              }}
              className="w-full px-4 py-2 text-right hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
            >
              <Download className="w-4 h-4 text-emerald-600" /> تصدير السجلات
            </button>
            <button
              onClick={() => {
                handlePrintSection(title);
                setOpenDropdown(null);
              }}
              className="w-full px-4 py-2 text-right hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
            >
              <Printer className="w-4 h-4 text-purple-600" /> طباعة التقرير
            </button>
            <div className="border-t my-1 border-slate-100"></div>
            <button
              onClick={() => {
                handleDeleteSelectedRecords(moduleKey);
                setOpenDropdown(null);
              }}
              className="w-full px-4 py-2 text-right hover:bg-red-50 flex items-center gap-2.5 text-red-600 font-medium"
            >
              <Trash2 className="w-4 h-4" /> حذف السجلات المحددة
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    setProjectsList([
      {
        id: Date.now(),
        ...newProject,
        budget: parseFloat(newProject.budget) || 0,
      },
      ...projectsList,
    ]);
    setActiveModal(null);
    setNewProject({
      name: '',
      client: '',
      budget: '',
      progress: 0,
      status: 'قيد التنفيذ',
    });
    showToast('تم حفظ المشروع بنجاح');
  };

  const handleUpdateProject = (e) => {
    e.preventDefault();
    if (!editingProject) return;
    setProjectsList(
      projectsList.map((p) => (p.id === editingProject.id ? editingProject : p))
    );
    setActiveModal(null);
    setEditingProject(null);
    showToast('تم تعديل المشروع بنجاح');
  };

  const handleSaveBudgetItem = (e) => {
    e.preventDefault();
    const item = {
      id: Date.now(),
      project: newBudgetItem.project,
      itemCode: newBudgetItem.itemCode,
      itemName: newBudgetItem.itemName,
      estimatedCost: parseFloat(newBudgetItem.estimatedCost) || 0,
      actualCost: parseFloat(newBudgetItem.actualCost) || 0,
    };
    setProjectBudgetItems([item, ...projectBudgetItems]);
    setActiveModal(null);
    setNewBudgetItem({
      project: '',
      itemCode: '',
      itemName: '',
      estimatedCost: '',
      actualCost: '',
    });
    showToast('تمت إضافة بند الميزانية بنجاح');
  };

  const handleSaveSupplier = (e) => {
    e.preventDefault();
    setSuppliersList([
      {
        id: Date.now(),
        ...newSupplier,
        purchases: parseFloat(newSupplier.purchases) || 0,
        due: parseFloat(newSupplier.due) || 0,
      },
      ...suppliersList,
    ]);
    setActiveModal(null);
    setNewSupplier({ name: '', spec: '', phone: '', purchases: '', due: '' });
    showToast('تمت إضافة المورد بنجاح');
  };

  const handleUpdateSupplier = (e) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setSuppliersList(
      suppliersList.map((s) =>
        s.id === editingSupplier.id ? editingSupplier : s
      )
    );
    setActiveModal(null);
    setEditingSupplier(null);
    showToast('تم تعديل المورد بنجاح');
  };

  const handleSaveSubcontractor = (e) => {
    e.preventDefault();
    setSubcontractorsList([
      {
        id: Date.now(),
        ...newSubcontractor,
        project: newSubcontractor.project || 'عام / غير مرتبطة',
        contract: parseFloat(newSubcontractor.contract) || 0,
        current: 0,
      },
      ...subcontractorsList,
    ]);
    setActiveModal(null);
    setNewSubcontractor({ name: '', spec: '', project: '', contract: '' });
    showToast('تمت إضافة مقاول الباطن بنجاح');
  };

  const handleUpdateSubcontractor = (e) => {
    e.preventDefault();
    if (!editingSubcontractor) return;
    setSubcontractorsList(
      subcontractorsList.map((sub) =>
        sub.id === editingSubcontractor.id ? editingSubcontractor : sub
      )
    );
    setActiveModal(null);
    setEditingSubcontractor(null);
    showToast('تم تحديث المقاول بنجاح');
  };

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    setEmployeesList([
      {
        id: Date.now(),
        ...newEmployee,
        salary: parseFloat(newEmployee.salary) || 0,
      },
      ...employeesList,
    ]);
    setActiveModal(null);
    setNewEmployee({ name: '', role: '', project: '', salary: '' });
    showToast('تمت إضافة الموظف بنجاح');
  };

  const handleUpdateEmployee = (e) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setEmployeesList(
      employeesList.map((emp) =>
        emp.id === editingEmployee.id ? editingEmployee : emp
      )
    );
    setActiveModal(null);
    setEditingEmployee(null);
    showToast('تم تحديث الموظف بنجاح');
  };

  const handleSaveCustody = (e) => {
    e.preventDefault();
    const addAmt = parseFloat(newCustody.amount) || 0;
    const existingIndex = custodyList.findIndex(
      (c) => c.name === newCustody.name && c.project === newCustody.project
    );
    if (existingIndex !== -1) {
      const updated = [...custodyList];
      updated[existingIndex].amount += addAmt;
      setCustodyList(updated);
    } else {
      setCustodyList([
        ...custodyList,
        { id: Date.now(), ...newCustody, amount: addAmt, spent: 0 },
      ]);
    }
    const tx = {
      id: Date.now(),
      desc: `تخصيص عهدة لـ ${newCustody.name}`,
      project: newCustody.project,
      type: 'صرف',
      amount: addAmt,
      date: new Date().toISOString().split('T')[0],
      created_by: currentUser?.name || 'مشرف',
      party_type: 'other',
      party_name: newCustody.name,
    };
    setTransactionsList([tx, ...transactionsList]);

    setCustodyTransactionsList([
      ...custodyTransactionsList,
      {
        id: Date.now(),
        custody_name: newCustody.name,
        type: 'addition',
        desc: 'تخصيص عهدة',
        amount: addAmt,
        status: 'معتمد',
        date: new Date().toISOString().split('T')[0],
        created_by: currentUser?.name || 'مشرف',
      },
    ]);
    setActiveModal(null);
    setNewCustody({ name: '', project: '', amount: '', spent: 0 });
    showToast('تم تخصيص العهدة بنجاح وترحيلها للحسابات المالية');
  };

  const handleSaveCustodyExpense = (e) => {
    e.preventDefault();
    const cObj = custodyList.find(
      (c) => c.name === newCustodyExpense.custodyId
    );
    if (!cObj) {
      showToast('الرجاء اختيار عهدة صحيحة من القائمة', 'error');
      return;
    }
    const amt = parseFloat(newCustodyExpense.amount) || 0;
    const tx = {
      id: Date.now(),
      custody_name: cObj.name,
      type: 'expense',
      desc: newCustodyExpense.desc,
      amount: amt,
      party_type: newCustodyExpense.partyType,
      party_name: newCustodyExpense.partyName || '',
      status: 'معلق',
      date: new Date().toISOString().split('T')[0],
      created_by: currentUser?.name || 'مدير مشروع',
    };

    setCustodyTransactionsList([tx, ...custodyTransactionsList]);
    setActiveModal(null);
    setNewCustodyExpense({
      custodyId: '',
      desc: '',
      amount: '',
      partyType: 'general',
      partyName: '',
    });
    showToast('تم إرسال طلب صرف المصروف للاعتماد بنجاح');
  };

  const handleApproveExpense = (txId) => {
    const tx = custodyTransactionsList.find((t) => t.id === txId);
    if (!tx || tx.status === 'معتمد') return;
    const cObj = custodyList.find((c) => c.name === tx.custody_name);
    if (!cObj) return;
    const amt = parseFloat(tx.amount) || 0;

    setCustodyList(
      custodyList.map((item) =>
        item.id === cObj.id
          ? { ...item, spent: (parseFloat(item.spent) || 0) + amt }
          : item
      )
    );
    setCustodyTransactionsList(
      custodyTransactionsList.map((t) =>
        t.id === txId ? { ...t, status: 'معتمد' } : t
      )
    );

    const financialTx = {
      id: Date.now(),
      desc: `مصروف عهدة (${tx.custody_name}): ${tx.desc}`,
      project: cObj.project,
      type: 'صرف',
      amount: amt,
      date: tx.date || new Date().toISOString().split('T')[0],
      created_by: tx.created_by || currentUser?.name || 'مشرف',
      party_type: tx.party_type || 'general',
      party_name: tx.party_name || '',
    };
    setTransactionsList((prev) => [financialTx, ...prev]);

    // إذا كان المصروف موجه لمقاول باطن، نقوم بتحديث رصيد المدفوعات الخاص به في المشروع المحدد
    if (tx.party_type === 'subcontractor' && tx.party_name) {
      setSubcontractorsList(
        subcontractorsList.map((sub) => {
          if (sub.name === tx.party_name && sub.project === cObj.project) {
            return { ...sub, current: (parseFloat(sub.current) || 0) + amt };
          }
          return sub;
        })
      );
    }

    showToast('تم اعتماد المصروف وترحيله تلقائياً للحسابات المالية بنجاح');
  };

  const handleSaveInventory = (e) => {
    e.preventDefault();
    setInventoryList([
      {
        id: Date.now(),
        code: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        ...newInventory,
        qty: parseFloat(newInventory.qty) || 0,
      },
      ...inventoryList,
    ]);
    setActiveModal(null);
    setNewInventory({ name: '', location: '', qty: '', unit: '' });
    showToast('تمت إضافة المادة للمستودع');
  };

  const handleSaveEquipment = (e) => {
    e.preventDefault();
    setEquipmentList([{ id: Date.now(), ...newEquipment }, ...equipmentList]);
    setActiveModal(null);
    setNewEquipment({ name: '', site: '', status: 'يعمل بالموقع' });
    showToast('تمت إضافة المعدة بنجاح');
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    setUsersList([...usersList, { id: Date.now(), ...newUser }]);
    setActiveModal(null);
    setNewUser({
      name: '',
      username: '',
      password: '',
      role: 'مدير مشروع',
      permissions: JSON.parse(JSON.stringify(defaultPermissions)),
    });
    showToast('تم حفظ المستخدم والصلاحيات');
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsersList(
      usersList.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    setActiveModal(null);
    setEditingUser(null);
    showToast('تم تحديث صلاحيات المستخدم والمشاريع المسموحة');
  };

  const handleSaveTransaction = (e) => {
    e.preventDefault();
    const amt = parseFloat(newTransaction.amount) || 0;
    const newTx = {
      id: Date.now(),
      ...newTransaction,
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      created_by: currentUser?.name || 'مشرف',
    };
    setTransactionsList([newTx, ...transactionsList]);

    // إذا كانت الحركة تخص مقاول باطن، نقوم بتحديث المدفوعات له في المشروع المحدد
    if (newTransaction.party_type === 'subcontractor' && newTransaction.party_name) {
      setSubcontractorsList(
        subcontractorsList.map((sub) => {
          if (sub.name === newTransaction.party_name && sub.project === newTransaction.project) {
            return { ...sub, current: (parseFloat(sub.current) || 0) + amt };
          }
          return sub;
        })
      );
    }

    setActiveModal(null);
    setNewTransaction({
      desc: '',
      project: '',
      type: 'صرف',
      amount: '',
      party_type: 'general',
      party_name: '',
    });
    showToast('تم تسجيل المعاملة بنجاح');
  };

  const handleSaveQuickProjectTx = (e) => {
    e.preventDefault();
    if (!selectedProjectForDetails) return;
    const amt = parseFloat(quickProjTx.amount) || 0;

    const tx = {
      id: Date.now(),
      desc: quickProjTx.desc,
      project: selectedProjectForDetails.name,
      type: 'صرف',
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      created_by: currentUser?.name || 'مشرف',
      party_type: quickProjTx.partyType,
      party_name: quickProjTx.partyName || '',
    };
    setTransactionsList([tx, ...transactionsList]);

    if (quickProjTx.partyType === 'supplier' && quickProjTx.partyName) {
      setSuppliersList(
        suppliersList.map((s) => {
          if (s.name === quickProjTx.partyName) {
            return { ...s, due: Math.max(0, (parseFloat(s.due) || 0) - amt) };
          }
          return s;
        })
      );
    } else if (
      quickProjTx.partyType === 'subcontractor' &&
      quickProjTx.partyName
    ) {
      setSubcontractorsList(
        subcontractorsList.map((sub) => {
          if (sub.name === quickProjTx.partyName && sub.project === selectedProjectForDetails.name) {
            return { ...sub, current: (parseFloat(sub.current) || 0) + amt };
          }
          return sub;
        })
      );
    }

    setQuickProjTx({
      desc: '',
      amount: '',
      partyType: 'general',
      partyName: '',
    });
    showToast('تم تسجيل وحفظ الحركة وترحيلها للحسابات المالية فوراً بنجاح');
  };

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white text-center">
            <Building2 className="w-12 h-12 mx-auto mb-2 text-blue-200" />
            <h1 className="text-2xl font-bold">
              {companySettings.companyName}
            </h1>
            <p className="text-blue-100 text-xs mt-1">
              نظام إدارة شركات المقاولات المتكامل
            </p>
          </div>
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm"
                />
              </div>
              {loginError && (
                <div className="text-red-500 text-xs text-center bg-red-50 p-2.5 rounded-lg">
                  {loginError}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700"
              >
                تسجيل الدخول
              </button>
            </form>
            <div className="mt-4 text-center text-xs text-slate-400">
              المشرف: (1 / 1) | طنطاوي: (2 / 2)
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canView = (key) =>
    currentUser?.username === '1' ||
    currentUser?.permissions?.[key]?.view !== false;

  const tabsConfig = [
    {
      id: 'dashboard',
      label: 'لوحة المؤشرات',
      icon: LayoutDashboard,
      perm: true,
    },
    {
      id: 'projects',
      label: 'إدارة المشاريع',
      icon: Briefcase,
      perm: canView('projects'),
    },
    {
      id: 'budget',
      label: 'ميزانية البنود التفصيلية',
      icon: Calculator,
      perm: canView('budget'),
    },
    {
      id: 'finance',
      label: 'الحسابات والمالية',
      icon: Wallet,
      perm: canView('finance'),
    },
    {
      id: 'suppliers',
      label: 'حسابات الموردين',
      icon: Truck,
      perm: canView('suppliers'),
    },
    {
      id: 'subcontractors',
      label: 'مقاولوا الباطن',
      icon: Handshake,
      perm: canView('subcontractors'),
    },
    {
      id: 'custody',
      label: 'حساب العهد والسلف',
      icon: FileText,
      perm: canView('custody'),
    },
    {
      id: 'inventory',
      label: 'المستودعات والمخزون',
      icon: Warehouse,
      perm: canView('inventory'),
    },
    {
      id: 'equipment',
      label: 'المعدات والآليات',
      icon: Wrench,
      perm: canView('equipment'),
    },
    {
      id: 'hr',
      label: 'الموارد البشرية والعمال',
      icon: Users,
      perm: canView('hr'),
    },
    {
      id: 'users',
      label: 'إدارة الصلاحيات',
      icon: Shield,
      perm: canView('users'),
    },
    {
      id: 'settings',
      label: 'إعدادات البرنامج',
      icon: Settings,
      perm: canView('settings'),
    },
    {
      id: 'reports',
      label: 'التقارير التحليلية',
      icon: LineChart,
      perm: canView('reports'),
    },
  ].filter((t) => t.perm);

  // حساب دقيق لمجموع ما تم دفعه لكل مقاول باطن بناءً على المشروع المرتبط من الحركات وعهد مديري المشاريع
  const getSubcontractorTotalPaid = (subName, subProject) => {
    let total = 0;
    // 1. حساب من الحركات المالية العامة
    transactionsList.forEach((tx) => {
      if (
        (tx.party_type === 'subcontractor' || (tx.desc && tx.desc.includes('مقاول'))) &&
        tx.party_name === subName
      ) {
        if (!subProject || subProject === 'عام / غير مرتبطة' || tx.project === subProject) {
          total += parseFloat(tx.amount || 0);
        }
      }
    });
    // 2. حساب من عهد مديري المشاريع المعتمدة
    custodyTransactionsList.forEach((ctx) => {
      if (ctx.status === 'معتمد' && ctx.party_type === 'subcontractor' && ctx.party_name === subName) {
        const cObj = custodyList.find((c) => c.name === ctx.custody_name);
        if (cObj && (!subProject || subProject === 'عام / غير مرتبطة' || cObj.project === subProject)) {
          total += parseFloat(ctx.amount || 0);
        }
      }
    });
    return total;
  };

  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 font-sans"
      dir="rtl"
    >
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-white block">
              {companySettings.companyName}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              ● متصل سحابياً
            </span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const showBadge =
              tab.id === 'custody' && myPendingExpenses.length > 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </div>
                {showBadge && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {myPendingExpenses.length} معلق
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="text-sm font-bold text-white mb-1">
            {currentUser?.name}
          </div>
          <div className="text-xs text-blue-400 mb-3">{currentUser?.role}</div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800">
              نظام إدارة المقاولات المتكامل
            </h2>
            {myPendingExpenses.length > 0 && (
              <div
                onClick={() => setActiveTab('custody')}
                className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer animate-bounce"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>
                  لديك {myPendingExpenses.length} مصروف معلق بانتظار
                  المتابعة/الاعتماد!
                </span>
              </div>
            )}
          </div>
          {/* اسم المستخدم مع إمكانية الضغط لتغيير كلمة المرور */}
          <div className="flex items-center">
            <button
              onClick={() => setActiveModal('changePassword')}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 transition shadow-sm cursor-pointer"
              title="اضغط لتغيير كلمة المرور"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <KeyRound className="w-3.5 h-3.5" />
              </div>
              <div className="text-right">
                <span className="block text-slate-900">{currentUser?.name}</span>
                <span className="text-[10px] text-blue-600 font-semibold">تغيير كلمة المرور</span>
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">المشاريع النشطة</p>
                    <h3 className="text-2xl font-black">
                      {accessibleProjects.length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">الموردين</p>
                    <h3 className="text-2xl font-black">
                      {suppliersList.length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">مقاولو الباطن</p>
                    <h3 className="text-2xl font-black">
                      {subcontractorsList.length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <Handshake className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">المعدات الثقيلة</p>
                    <h3 className="text-2xl font-black">
                      {equipmentList.length}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Wrench className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl shadow-sm text-white flex justify-between items-center ${companySettings.moduleColors.projects}`}
              >
                <div>
                  <h3 className="text-lg font-bold">
                    إدارة المشاريع الإنشائية
                  </h3>
                  <p className="text-xs text-blue-100 mt-1">
                    اضغط على أي مشروع لعرض وإضافة الحركات والمصاريف التفصيلية
                    الخاصة به.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {renderModuleDropdownMenu(
                    'projects',
                    accessibleProjects,
                    'المشاريع'
                  )}
                  {(currentUser.username === '1' ||
                    currentUser.permissions?.projects?.edit) && (
                    <button
                      onClick={() => setActiveModal('project')}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" /> إضافة مشروع
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accessibleProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProjectForDetails(p);
                      setActiveModal('projectDetails');
                    }}
                    className="bg-white p-6 rounded-2xl shadow-sm border space-y-4 flex flex-col justify-between cursor-pointer hover:border-blue-500 transition group"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition">
                          {p.name}
                        </h4>
                        {(currentUser.username === '1' ||
                          currentUser.permissions?.projects?.edit) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProject(p);
                              setActiveModal('editProject');
                            }}
                            className="text-blue-600 bg-blue-50 p-1.5 rounded-lg"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        العميل: {p.client}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>
                          الميزانية: {Number(p.budget).toLocaleString()}{' '}
                          {companySettings.currency}
                        </span>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full"
                          style={{ width: `${p.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Subtotal لـ المشاريع */}
              <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center text-xs font-bold text-slate-700">
                <span>إجمالي عدد المشاريع الظاهرة: {accessibleProjects.length}</span>
                <span>
                  إجمالي الميزانيات: {accessibleProjects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0).toLocaleString()} {companySettings.currency}
                </span>
              </div>
            </div>
          )}

          {/* BUDGET TAB */}
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl shadow-sm text-white flex justify-between items-center ${
                  companySettings.moduleColors.budget || 'bg-sky-600'
                }`}
              >
                <div>
                  <h3 className="text-lg font-bold">
                    ميزانية وتكلفة بنود المشروع التفصيلية
                  </h3>
                  <p className="text-xs text-sky-100 mt-1">
                    مقارنة التكلفة التقديرية بالتكلفة الفعلية لكل بند إنشائي.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {renderModuleDropdownMenu(
                    'budget',
                    projectBudgetItems,
                    'ميزانية_البنود'
                  )}
                  <button
                    onClick={() => setActiveModal('budgetItem')}
                    className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                  >
                    <Plus className="w-4 h-4" /> إضافة بند للميزانية
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4">
                <label className="text-xs font-bold text-slate-600">
                  اختر المشروع لعرض بنوده:
                </label>
                <select
                  value={selectedProjectForBudget}
                  onChange={(e) => setSelectedProjectForBudget(e.target.value)}
                  className="border p-2 rounded-xl text-sm bg-white min-w-[250px]"
                >
                  <option value="">-- كل المشاريع --</option>
                  {accessibleProjects.map((p, idx) => (
                    <option key={idx} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 text-xs">
                      <th className="pb-3 w-8">#</th>
                      <th className="pb-3">المشروع</th>
                      <th className="pb-3">كود البند</th>
                      <th className="pb-3">اسم البند الإنشائي</th>
                      <th className="pb-3">التكلفة التقديرية</th>
                      <th className="pb-3">التكلفة الفعلية</th>
                      <th className="pb-3">الفرق (الانحراف)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {projectBudgetItems
                      .filter(
                        (b) =>
                          !selectedProjectForBudget ||
                          b.project === selectedProjectForBudget
                      )
                      .map((b) => {
                        const isSelected = (
                          selectedRows['budget'] || []
                        ).includes(b.id);
                        const diff =
                          Number(b.estimatedCost) - Number(b.actualCost);
                        return (
                          <tr key={b.id} className="hover:bg-slate-50">
                            <td className="py-3">
                              <button
                                onClick={() =>
                                  toggleRowSelection('budget', b.id)
                                }
                                className="text-slate-400 hover:text-sky-600"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-sky-600" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            <td className="py-3 font-semibold text-slate-700">
                              {b.project}
                            </td>
                            <td className="py-3 font-mono text-xs">
                              {b.itemCode}
                            </td>
                            <td className="py-3 font-bold">{b.itemName}</td>
                            <td className="py-3 font-bold">
                              {Number(b.estimatedCost).toLocaleString()}{' '}
                              {companySettings.currency}
                            </td>
                            <td className="py-3 font-bold text-red-600">
                              {Number(b.actualCost).toLocaleString()}{' '}
                              {companySettings.currency}
                            </td>
                            <td
                              className={`py-3 font-bold ${
                                diff >= 0 ? 'text-emerald-600' : 'text-red-600'
                              }`}
                            >
                              {diff.toLocaleString()} {companySettings.currency}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {/* Subtotal لـ ميزانية البنود */}
                {(() => {
                  const filteredBudget = projectBudgetItems.filter(
                    (b) => !selectedProjectForBudget || b.project === selectedProjectForBudget
                  );
                  const totEst = filteredBudget.reduce((sum, b) => sum + (parseFloat(b.estimatedCost) || 0), 0);
                  const totAct = filteredBudget.reduce((sum, b) => sum + (parseFloat(b.actualCost) || 0), 0);
                  return (
                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl">
                      <span>إجمالي بنود الميزانية الظاهرة: {filteredBudget.length}</span>
                      <div className="flex gap-4">
                        <span>إجمالي التقديري: {totEst.toLocaleString()} {companySettings.currency}</span>
                        <span className="text-red-600">إجمالي الفعلي: {totAct.toLocaleString()} {companySettings.currency}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* FINANCE TAB */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl shadow-sm text-white flex justify-between items-center ${companySettings.moduleColors.finance}`}
              >
                <h3 className="text-lg font-bold">الحسابات والمالية</h3>
                <div className="flex items-center gap-3">
                  {renderModuleDropdownMenu(
                    'finance',
                    transactionsList,
                    'الحركات_المالية'
                  )}
                  {(currentUser.username === '1' ||
                    currentUser.permissions?.finance?.edit) && (
                    <button
                      onClick={() => setActiveModal('transaction')}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" /> تسجيل حركة مالية
                    </button>
                  )}
                </div>
              </div>

              {/* فلاتر شاشة الحسابات والمالية */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border space-y-3">
                <div className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-emerald-600" /> فلاتر الحركات المالية:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">من تاريخ:</label>
                    <input
                      type="date"
                      value={financeFilterStart}
                      onChange={(e) => setFinanceFilterStart(e.target.value)}
                      className="w-full border p-2 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">إلى تاريخ:</label>
                    <input
                      type="date"
                      value={financeFilterEnd}
                      onChange={(e) => setFinanceFilterEnd(e.target.value)}
                      className="w-full border p-2 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">اسم المشروع:</label>
                    <select
                      value={financeFilterProject}
                      onChange={(e) => setFinanceFilterProject(e.target.value)}
                      className="w-full border p-2 rounded-xl bg-white"
                    >
                      <option value="">-- كل المشاريع --</option>
                      {accessibleProjects.map((p, idx) => (
                        <option key={idx} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">منشئ السجل:</label>
                    <input
                      type="text"
                      placeholder="اسم المستخدم..."
                      value={financeFilterCreator}
                      onChange={(e) => setFinanceFilterCreator(e.target.value)}
                      className="w-full border p-2 rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 text-xs">
                      <th className="pb-3 w-8">#</th>
                      <th className="pb-3">البيان</th>
                      <th className="pb-3">المشروع</th>
                      <th className="pb-3">النوع</th>
                      <th className="pb-3">الجهة المصروف إليها</th>
                      <th className="pb-3">المبلغ</th>
                      <th className="pb-3">التاريخ</th>
                      <th className="pb-3">بواسطة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactionsList
                      .filter((t) => {
                        if (financeFilterStart && t.date < financeFilterStart) return false;
                        if (financeFilterEnd && t.date > financeFilterEnd) return false;
                        if (financeFilterProject && t.project !== financeFilterProject) return false;
                        if (financeFilterCreator && !(t.created_by || '').includes(financeFilterCreator)) return false;
                        return true;
                      })
                      .map((t) => {
                        const isSelected = (
                          selectedRows['finance'] || []
                        ).includes(t.id);
                        
                        let partyBadgeText = 'تكلفة أخري';
                        let partyBadgeClass = 'bg-slate-100 text-slate-700';
                        const pType = t.party_type || (t.party_name ? 'other' : 'general');
                        if (pType === 'subcontractor' || (t.desc && t.desc.includes('مقاول'))) {
                          partyBadgeText = `مقاول: ${t.party_name || ''}`;
                          partyBadgeClass = 'bg-purple-50 text-purple-700';
                        } else if (pType === 'supplier' || (t.desc && t.desc.includes('مورد'))) {
                          partyBadgeText = `مورد: ${t.party_name || ''}`;
                          partyBadgeClass = 'bg-teal-50 text-teal-700';
                        } else if (t.party_name) {
                          partyBadgeText = `أخرى: ${t.party_name}`;
                          partyBadgeClass = 'bg-slate-100 text-slate-700';
                        }

                        return (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="py-3">
                              <button
                                onClick={() =>
                                  toggleRowSelection('finance', t.id)
                                }
                                className="text-slate-400 hover:text-emerald-600"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            <td className="py-3 font-semibold">{t.desc}</td>
                            <td className="py-3 text-slate-600">{t.project}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  t.type === 'قبض'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-700'
                                }`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold inline-block ${partyBadgeClass}`}>
                                {partyBadgeText}
                              </span>
                            </td>
                            <td className="py-3 font-bold">
                              {Number(t.amount).toLocaleString()}{' '}
                              {companySettings.currency}
                            </td>
                            <td className="py-3 text-xs text-slate-400">
                              {t.date}
                            </td>
                            <td className="py-3 text-xs text-blue-600 font-semibold">
                              {t.created_by || 'مشرف'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {/* Subtotal لـ الحسابات والمالية */}
                {(() => {
                  const filteredTx = transactionsList.filter((t) => {
                    if (financeFilterStart && t.date < financeFilterStart) return false;
                    if (financeFilterEnd && t.date > financeFilterEnd) return false;
                    if (financeFilterProject && t.project !== financeFilterProject) return false;
                    if (financeFilterCreator && !(t.created_by || '').includes(financeFilterCreator)) return false;
                    return true;
                  });
                  const totDep = filteredTx.filter(t => t.type === 'قبض').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                  const totWd = filteredTx.filter(t => t.type === 'صرف').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                  return (
                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl">
                      <span>إجمالي الحركات الظاهرة: {filteredTx.length}</span>
                      <div className="flex gap-4">
                        <span className="text-emerald-600">إجمالي القبض: {totDep.toLocaleString()} {companySettings.currency}</span>
                        <span className="text-red-600">إجمالي الصرف: {totWd.toLocaleString()} {companySettings.currency}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* SUPPLIERS TAB */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl shadow-sm text-white flex justify-between items-center ${companySettings.moduleColors.suppliers}`}
              >
                <h3 className="text-lg font-bold">حسابات الموردين</h3>
                <div className="flex items-center gap-3">
                  {renderModuleDropdownMenu(
                    'suppliers',
                    suppliersList,
                    'الموردين'
                  )}
                  {(currentUser.username === '1' ||
                    currentUser.permissions?.suppliers?.edit) && (
                    <button
                      onClick={() => setActiveModal('supplier')}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" /> إضافة مورد
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 text-xs">
                      <th className="pb-3 w-8">#</th>
                      <th className="pb-3">اسم المورد</th>
                      <th className="pb-3">التخصص</th>
                      <th className="pb-3">الهاتف</th>
                      <th className="pb-3">المشتريات</th>
                      <th className="pb-3">المستحق</th>
                      <th className="pb-3 text-center">كشف الحساب</th>
                      <th className="pb-3">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {suppliersList.map((s) => {
                      const isSelected = (
                        selectedRows['suppliers'] || []
                      ).includes(s.id);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-3">
                            <button
                              onClick={() =>
                                toggleRowSelection('suppliers', s.id)
                              }
                              className="text-slate-400 hover:text-teal-600"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-teal-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 font-semibold">{s.name}</td>
                          <td className="py-3 text-slate-600">{s.spec}</td>
                          <td className="py-3 font-mono text-xs">{s.phone}</td>
                          <td className="py-3 font-bold">
                            {Number(s.purchases).toLocaleString()}{' '}
                            {companySettings.currency}
                          </td>
                          <td className="py-3 font-bold text-red-600">
                            {Number(s.due).toLocaleString()}{' '}
                            {companySettings.currency}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedPartyForAccountStatement({
                                  type: 'supplier',
                                  name: s.name,
                                });
                                setActiveModal('partyStatement');
                              }}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-4 h-4" /> كشف الحساب
                            </button>
                          </td>
                          <td className="py-3">
                            {(currentUser.username === '1' ||
                              currentUser.permissions?.suppliers?.edit) && (
                              <button
                                onClick={() => {
                                  setEditingSupplier(s);
                                  setActiveModal('editSupplier');
                                }}
                                className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-bold"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Subtotal لـ الموردين */}
                <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl">
                  <span>إجمالي عدد الموردين الظاهرين: {suppliersList.length}</span>
                  <div className="flex gap-4">
                    <span>إجمالي المشتريات: {suppliersList.reduce((sum, s) => sum + (parseFloat(s.purchases) || 0), 0).toLocaleString()} {companySettings.currency}</span>
                    <span className="text-red-600">إجمالي المستحق: {suppliersList.reduce((sum, s) => sum + (parseFloat(s.due) || 0), 0).toLocaleString()} {companySettings.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBCONTRACTORS TAB */}
          {activeTab === 'subcontractors' && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl shadow-sm text-white flex justify-between items-center ${companySettings.moduleColors.subcontractors}`}
              >
                <div>
                  <h3 className="text-lg font-bold">مقاولو الباطن</h3>
                  <p className="text-xs text-purple-100 mt-1">
                    متابعة العقود والمستخلصات وكشوف الحساب التفصيلية لكل مشروع على حدة.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {renderModuleDropdownMenu(
                    'subcontractors',
                    subcontractorsList,
                    'مقاولى_الباطن'
                  )}
                  {(currentUser.username === '1' ||
                    currentUser.permissions?.subcontractors?.edit) && (
                    <button
                      onClick={() => setActiveModal('subcontractor')}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" /> إضافة مقاول
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 text-xs">
                      <th className="pb-3 w-8">#</th>
                      <th className="pb-3">اسم المقاول</th>
                      <th className="pb-3">التخصص</th>
                      <th className="pb-3">المشروع المرتبط</th>
                      <th className="pb-3">قيمة العقد</th>
                      <th className="pb-3">إجمالي ما تم دفعه</th>
                      <th className="pb-3 text-center">كشف الحساب</th>
                      <th className="pb-3">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {subcontractorsList.map((sub) => {
                      const isSelected = (
                        selectedRows['subcontractors'] || []
                      ).includes(sub.id);
                      const totalPaid = getSubcontractorTotalPaid(sub.name, sub.project);
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="py-3">
                            <button
                              onClick={() =>
                                toggleRowSelection('subcontractors', sub.id)
                              }
                              className="text-slate-400 hover:text-purple-600"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-purple-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 font-semibold">{sub.name}</td>
                          <td className="py-3 text-slate-600">{sub.spec}</td>
                          <td className="py-3 text-slate-600">{sub.project}</td>
                          <td className="py-3 font-bold">
                            {Number(sub.contract).toLocaleString()}{' '}
                            {companySettings.currency}
                          </td>
                          <td className="py-3 font-bold text-emerald-600">
                            {Number(totalPaid).toLocaleString()}{' '}
                            {companySettings.currency}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedPartyForAccountStatement({
                                  type: 'subcontractor',
                                  name: sub.name,
                                  project: sub.project,
                                });
                                setActiveModal('partyStatement');
                              }}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-4 h-4" /> كشف الحساب
                            </button>
                          </td>
                          <td className="py-3">
                            {(currentUser.username === '1' ||
                              currentUser.permissions?.subcontractors
                                ?.edit) && (
                              <button
                                onClick={() => {
                                  setEditingSubcontractor(sub);
                                  setActiveModal('editSubcontractor');
                                }}
                                className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-bold"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Subtotal لـ مقاولو الباطن */}
                <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl">
                  <span>إجمالي عدد مقاولي الباطن الظاهرين: {subcontractorsList.length}</span>
                  <div className="flex gap-4">
                    <span>إجمالي العقود: {subcontractorsList.reduce((sum, sub) => sum + (parseFloat(sub.contract) || 0), 0).toLocaleString()} {companySettings.currency}</span>
                    <span className="text-emerald-600">إجمالي المدفوع: {subcontractorsList.reduce((sum, sub) => sum + getSubcontractorTotalPaid(sub.name, sub.project), 0).toLocaleString()} {companySettings.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CUSTODY TAB */}
          {activeTab === 'custody' && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl shadow-sm text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${companySettings.moduleColors.custody}`}
              >
                <div>
                  <h3 className="text-lg font-bold">
                    حساب العهد والسلف لمديري المشاريع
                  </h3>
                  <p className="text-xs text-rose-100 mt-1">
                    تجميع العهد، خصم المصروفات بعد الاعتماد، وتحديث حسابات
                    المقاولين والموردين.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {renderModuleDropdownMenu(
                    'custody',
                    custodyList,
                    'العهد_والسلف'
                  )}

                  {(currentUser.username === '1' ||
                    currentUser.permissions?.custody?.allocate !== false) && (
                    <button
                      onClick={() => setActiveModal('custody')}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" /> تخصيص عهدة جديدة
                    </button>
                  )}

                  {currentUser.username === '1' ||
                  currentUser.permissions?.custody?.edit !== false ? (
                    <button
                      onClick={() => setActiveModal('custodyExpense')}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                    >
                      <ArrowDownRight className="w-4 h-4" /> طلب صرف مصروف
                    </button>
                  ) : null}
                </div>
              </div>

              {(currentUser.username === '1' ||
                currentUser.permissions?.custody?.approve !== false) &&
                custodyTransactionsList.filter((tx) => tx.status === 'معلق')
                  .length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-3">
                    <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                      طلبات مصروفات عهد معلقة بانتظار الاعتماد والخصم:
                    </h4>
                    <div className="space-y-2">
                      {custodyTransactionsList
                        .filter((tx) => tx.status === 'معلق')
                        .map((tx) => (
                          <div
                            key={tx.id}
                            className="bg-white p-3 rounded-xl border border-amber-200 flex justify-between items-center text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-800">
                                العهدة: {tx.custody_name}
                              </span>{' '}
                              •
                              <span className="text-slate-600 mr-2">
                                {' '}
                                البيان: {tx.desc}
                              </span>
                              {tx.party_name && (
                                <span className="text-blue-600 mr-2">
                                  (
                                  {tx.party_type === 'subcontractor'
                                    ? 'مقاول'
                                    : 'مورد'}
                                  : {tx.party_name})
                                </span>
                              )}
                              <span className="text-red-600 font-bold mr-3">
                                {parseFloat(tx.amount || 0).toLocaleString()}{' '}
                                {companySettings.currency}
                              </span>
                              <span className="text-slate-400 mr-2">
                                ({tx.created_by})
                              </span>
                            </div>
                            <button
                              onClick={() => handleApproveExpense(tx.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> اعتماد وخصم
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 text-xs">
                      <th className="pb-3">مدير المشروع (المسؤول)</th>
                      <th className="pb-3">المشروع</th>
                      <th className="pb-3">إجمالي العهدة المجمعة</th>
                      <th className="pb-3">المصروف الفعلي (المعتمد)</th>
                      <th className="pb-3">الرصيد المتبقي الصافي</th>
                      <th className="pb-3 text-center">التقرير / كشف الحساب</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {custodyList
                      .filter(
                        (c) =>
                          currentUser.username === '1' ||
                          accessibleProjects.some((p) => p.name === c.project)
                      )
                      .map((c, idx) => {
                        const amt = parseFloat(c.amount) || 0;
                        const spt = parseFloat(c.spent) || 0;
                        const rem = amt - spt;
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-3 font-semibold text-slate-800">
                              {c.name}
                            </td>
                            <td className="py-3 text-slate-600">{c.project}</td>
                            <td className="py-3 font-bold">
                              {amt.toLocaleString()} {companySettings.currency}
                            </td>
                            <td className="py-3 text-red-600 font-semibold">
                              {spt.toLocaleString()} {companySettings.currency}
                            </td>
                            <td className="py-3 font-bold text-emerald-600">
                              {rem.toLocaleString()} {companySettings.currency}
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedCustodyForReport(c);
                                  setActiveModal('custodyReport');
                                }}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
                              >
                                <Eye className="w-4 h-4" /> عرض كشف الحساب
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {/* Subtotal لـ العهد والسلف */}
                {(() => {
                  const filteredCustody = custodyList.filter(
                    (c) => currentUser.username === '1' || accessibleProjects.some((p) => p.name === c.project)
                  );
                  const totAmt = filteredCustody.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
                  const totSpent = filteredCustody.reduce((sum, c) => sum + (parseFloat(c.spent) || 0), 0);
                  const totRem = totAmt - totSpent;
                  return (
                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl">
                      <span>إجمالي العهد الظاهرة: {filteredCustody.length}</span>
                      <div className="flex gap-4">
                        <span>إجمالي العهد: {totAmt.toLocaleString()} {companySettings.currency}</span>
                        <span className="text-red-600">إجمالي المصروف: {totSpent.toLocaleString()} {companySettings.currency}</span>
                        <span className="text-emerald-600">إجمالي المتبقي: {totRem.toLocaleString()} {companySettings.currency}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl shadow-sm text-white flex justify-between items-center ${companySettings.moduleColors.inventory}`}
              >
                <h3 className="text-lg font-bold">المستودعات ومواد البناء</h3>
                <div className="flex items-center gap-3">
                  {renderModuleDropdownMenu(
                    'inventory',
                    inventoryList,
                    'المستودع'
                  )}
                  {(currentUser.username === '1' ||
                    currentUser.permissions?.inventory?.edit) && (
                    <button
                      onClick={() => setActiveModal('inventory')}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" /> إضافة مادة
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 text-xs">
                      <th className="pb-3 w-8">#</th>
                      <th className="pb-3">الكود</th>
                      <th className="pb-3">اسم المادة</th>
                      <th className="pb-3">الموقع</th>
                      <th className="pb-3">الكمية</th>
                      <th className="pb-3">الوحدة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {inventoryList.map((i) => {
                      const isSelected = (
                        selectedRows['inventory'] || []
                      ).includes(i.id);
                      return (
                        <tr key={i.id} className="hover:bg-slate-50">
                          <td className="py-3">
                            <button
                              onClick={() =>
                                toggleRowSelection('inventory', i.id)
                              }
                              className="text-slate-400 hover:text-amber-600"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 font-mono text-xs">{i.code}</td>
                          <td className="py-3 font-semibold">{i.name}</td>
                          <td className="py-3 text-slate-600">{i.location}</td>
                          <td className="py-3 font-bold">
                            {Number(i.qty).toLocaleString()}
                          </td>
                          <td className="py-3 text-slate-500">{i.unit}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Subtotal لـ المستودعات */}
                <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl">
                  <span>إجمالي عدد المواد بالمستودع: {inventoryList.length}</span>
                  <span>إجمالي الكميات: {inventoryList.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* EQUIPMENT TAB */}
          {activeTab === 'equipment' && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl shadow-sm text-white flex justify-between items-center ${companySettings.moduleColors.equipment}`}
              >
                <h3 className="text-lg font-bold">المعدات الثقيلة والآليات</h3>
                <div className="flex items-center gap-3">
                  {renderModuleDropdownMenu(
                    'equipment',
                    equipmentList,
                    'المعدات'
                  )}
                  {(currentUser.username === '1' ||
                    currentUser.permissions?.equipment?.edit) && (
                    <button
                      onClick={() => setActiveModal('equipment')}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" /> إضافة معدة
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipmentList.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">
                        {eq.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        الموقع: {eq.site}
                      </p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {eq.status}
                    </span>
                  </div>
                ))}
              </div>
              {/* Subtotal لـ المعدات */}
              <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center text-xs font-bold text-slate-700">
                <span>إجمالي عدد المعدات الثقيلة والآليات: {equipmentList.length}</span>
              </div>
            </div>
          )}

          {/* HR TAB */}
          {activeTab === 'hr' && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl shadow-sm text-white flex justify-between items-center ${companySettings.moduleColors.hr}`}
              >
                <h3 className="text-lg font-bold">
                  الموارد البشرية وكشوف الرواتب
                </h3>
                <div className="flex items-center gap-3">
                  {renderModuleDropdownMenu(
                    'employees',
                    employeesList,
                    'الموظفين'
                  )}
                  {(currentUser.username === '1' ||
                    currentUser.permissions?.hr?.edit) && (
                    <button
                      onClick={() => setActiveModal('employee')}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" /> إضافة موظف
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 text-xs">
                      <th className="pb-3 w-8">#</th>
                      <th className="pb-3">الاسم</th>
                      <th className="pb-3">الوظيفة</th>
                      <th className="pb-3">المشروع</th>
                      <th className="pb-3">الراتب</th>
                      <th className="pb-3">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {employeesList.map((e) => {
                      const isSelected = (
                        selectedRows['employees'] || []
                      ).includes(e.id);
                      return (
                        <tr key={e.id} className="hover:bg-slate-50">
                          <td className="py-3">
                            <button
                              onClick={() =>
                                toggleRowSelection('employees', e.id)
                              }
                              className="text-slate-400 hover:text-indigo-600"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 font-semibold">{e.name}</td>
                          <td className="py-3 text-slate-600">{e.role}</td>
                          <td className="py-3 text-slate-600">{e.project}</td>
                          <td className="py-3 font-bold text-emerald-700">
                            {Number(e.salary).toLocaleString()}{' '}
                            {companySettings.currency}
                          </td>
                          <td className="py-3">
                            {(currentUser.username === '1' ||
                              currentUser.permissions?.hr?.edit) && (
                              <button
                                onClick={() => {
                                  setEditingEmployee(e);
                                  setActiveModal('editEmployee');
                                }}
                                className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-bold"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Subtotal لـ الموارد البشرية */}
                <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl">
                  <span>إجمالي عدد الموظفين الظاهرين: {employeesList.length}</span>
                  <span className="text-emerald-700">
                    إجمالي الرواتب الأساسية: {employeesList.reduce((sum, e) => sum + (parseFloat(e.salary) || 0), 0).toLocaleString()} {companySettings.currency}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl shadow-sm text-white flex justify-between items-center ${companySettings.moduleColors.users}`}
              >
                <div>
                  <h3 className="text-lg font-bold">
                    إدارة المستخدمين والصلاحيات المتقدمة
                  </h3>
                  <p className="text-xs text-slate-200 mt-1">
                    تحديد المشاريع المسموحة وصلاحيات الموديولات لكل مستخدم.
                  </p>
                </div>
                {currentUser.username === '1' && (
                  <button
                    onClick={() => setActiveModal('user')}
                    className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow"
                  >
                    <Plus className="w-4 h-4" /> إضافة مستخدم
                  </button>
                )}
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 text-xs">
                      <th className="pb-3">الاسم</th>
                      <th className="pb-3">اسم الدخول</th>
                      <th className="pb-3">الدور الوظيفي</th>
                      <th className="pb-3">المشاريع المسموحة</th>
                      <th className="pb-3">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 font-semibold">{u.name}</td>
                        <td className="py-3 font-mono text-xs">{u.username}</td>
                        <td className="py-3">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-full text-xs font-bold">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-slate-600">
                          {u.permissions?.allowedProjects?.length > 0
                            ? u.permissions.allowedProjects.join(', ')
                            : 'جميع المشاريع'}
                        </td>
                        <td className="py-3">
                          {currentUser.username === '1' &&
                            u.username !== '1' && (
                              <button
                                onClick={() => {
                                  setEditingUser(JSON.parse(JSON.stringify(u)));
                                  setActiveModal('editUser');
                                }}
                                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> تعديل
                                الصلاحيات والمشاريع
                              </button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Subtotal لـ المستخدمين */}
                <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl">
                  <span>إجمالي عدد المستخدمين: {usersList.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-3">
                إعدادات البرنامج وتخصيص الألوان
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast('تم حفظ إعدادات الشركة والألوان بنجاح');
                }}
                className="space-y-4 text-sm"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    اسم الشركة الرسمي
                  </label>
                  <input
                    type="text"
                    value={companySettings.companyName}
                    onChange={(e) =>
                      setCompanySettings({
                        ...companySettings,
                        companyName: e.target.value,
                      })
                    }
                    className="w-full border p-2.5 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      رقم الموبايل
                    </label>
                    <input
                      type="text"
                      value={companySettings.phone}
                      onChange={(e) =>
                        setCompanySettings({
                          ...companySettings,
                          phone: e.target.value,
                        })
                      }
                      className="w-full border p-2.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      العنوان
                    </label>
                    <input
                      type="text"
                      value={companySettings.address}
                      onChange={(e) =>
                        setCompanySettings({
                          ...companySettings,
                          address: e.target.value,
                        })
                      }
                      className="w-full border p-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-xs text-slate-700 mb-3">
                    تخصيص ألوان الواجهة والتبويبات الرئيسية:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'projects', label: 'المشاريع' },
                      { key: 'budget', label: 'ميزانية البنود' },
                      { key: 'finance', label: 'المالية' },
                      { key: 'suppliers', label: 'الموردين' },
                      { key: 'subcontractors', label: 'مقاولو الباطن' },
                      { key: 'custody', label: 'العهد والسلف' },
                      { key: 'inventory', label: 'المستودعات' },
                    ].map((mod) => (
                      <div
                        key={mod.key}
                        className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border"
                      >
                        <span className="text-xs font-medium">{mod.label}</span>
                        <select
                          value={
                            companySettings.moduleColors[mod.key] ||
                            'bg-blue-600'
                          }
                          onChange={(e) =>
                            setCompanySettings({
                              ...companySettings,
                              moduleColors: {
                                ...companySettings.moduleColors,
                                [mod.key]: e.target.value,
                              },
                            })
                          }
                          className="border p-1 rounded-lg text-xs bg-white font-medium"
                        >
                          <option value="bg-blue-600">أزرق</option>
                          <option value="bg-emerald-600">أخضر زمردي</option>
                          <option value="bg-purple-600">بنفسجي</option>
                          <option value="bg-rose-600">حبيبي / وردي</option>
                          <option value="bg-amber-600">عنبري / أصفر</option>
                          <option value="bg-sky-600">سماوي</option>
                          <option value="bg-indigo-600">نيلي</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition"
                >
                  حفظ التغييرات
                </button>
              </form>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                التقارير التحليلية
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                استخراج الموقف المالي وحالة المواقع وتصديرها إكسل.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  onClick={() =>
                    exportToExcel(transactionsList, 'تقرير_المالية')
                  }
                  className="p-5 bg-slate-50 border rounded-2xl text-center cursor-pointer hover:border-blue-500"
                >
                  <h4 className="font-bold text-slate-800 text-sm">
                    تقرير الحركات المالية (Excel)
                  </h4>
                </div>
                <div
                  onClick={() => exportToExcel(suppliersList, 'تقرير_الموردين')}
                  className="p-5 bg-slate-50 border rounded-2xl text-center cursor-pointer hover:border-blue-500"
                >
                  <h4 className="font-bold text-slate-800 text-sm">
                    تقرير حسابات الموردين (Excel)
                  </h4>
                </div>
                <div
                  onClick={() => exportToExcel(custodyList, 'تقرير_العهد')}
                  className="p-5 bg-slate-50 border rounded-2xl text-center cursor-pointer hover:border-blue-500"
                >
                  <h4 className="font-bold text-slate-800 text-sm">
                    تقرير العهد والسلف (Excel)
                  </h4>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <h3 className="font-bold text-slate-800 text-lg mb-4">
              {activeModal === 'changePassword'
                ? 'تغيير كلمة المرور الخاصة بالمستخدم'
                : activeModal === 'projectDetails' && selectedProjectForDetails
                ? `تفاصيل وحركات المشروع: ${selectedProjectForDetails.name}`
                : activeModal === 'editUser'
                ? 'تعديل الصلاحيات والمشاريع للمستخدم'
                : activeModal === 'project'
                ? 'إضافة مشروع جديد'
                : activeModal === 'editProject'
                ? 'تعديل المشروع'
                : activeModal === 'budgetItem'
                ? 'إضافة بند ميزانية تفصيلي للمشروع'
                : activeModal === 'supplier'
                ? 'إضافة مورد'
                : activeModal === 'editSupplier'
                ? 'تعديل مورد'
                : activeModal === 'subcontractor'
                ? 'إضافة مقاول باطن'
                : activeModal === 'editSubcontractor'
                ? 'تعديل مقاول باطن'
                : activeModal === 'employee'
                ? 'إضافة موظف'
                : activeModal === 'editEmployee'
                ? 'تعديل موظف'
                : activeModal === 'custody'
                ? 'تخصيص عهدة جديدة'
                : activeModal === 'custodyExpense'
                ? 'طلب صرف مصروف'
                : activeModal === 'custodyReport'
                ? 'كشف حساب العهدة'
                : activeModal === 'partyStatement'
                ? 'كشف الحساب التفصيلي'
                : activeModal === 'inventory'
                ? 'إضافة مادة للمستودع'
                : activeModal === 'equipment'
                ? 'إضافة معدة'
                : activeModal === 'user'
                ? 'إضافة مستخدم جديد'
                : 'نافذة العمليات'}
            </h3>

            {/* نافذة تغيير كلمة المرور */}
            {activeModal === 'changePassword' && (
              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">كلمة المرور الحالية:</label>
                  <input
                    type="password"
                    value={passwordForm.currentPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPass: e.target.value })}
                    required
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">كلمة المرور الجديدة:</label>
                  <input
                    type="password"
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                    required
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">تأكيد كلمة المرور الجديدة:</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                    required
                    className="w-full border p-2.5 rounded-xl text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setPasswordForm({ currentPass: '', newPass: '', confirmPass: '' });
                    }}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow"
                  >
                    حفظ كلمة المرور الجديدة
                  </button>
                </div>
              </form>
            )}

            {/* تفاصيل المشروع */}
            {activeModal === 'projectDetails' && selectedProjectForDetails && (
              <div className="space-y-5 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border space-y-1">
                  <p>
                    <b>اسم المشروع:</b> {selectedProjectForDetails.name}
                  </p>
                  <p>
                    <b>العميل:</b> {selectedProjectForDetails.client}
                  </p>
                  <p>
                    <b>الميزانية:</b>{' '}
                    {Number(selectedProjectForDetails.budget).toLocaleString()}{' '}
                    {companySettings.currency}
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-2">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5" /> فلاتر البحث والفلترة:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">
                        من تاريخ:
                      </label>
                      <input
                        type="date"
                        value={projFilterStart}
                        onChange={(e) => setProjFilterStart(e.target.value)}
                        className="w-full border p-1.5 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">
                        إلى تاريخ:
                      </label>
                      <input
                        type="date"
                        value={projFilterEnd}
                        onChange={(e) => setProjFilterEnd(e.target.value)}
                        className="w-full border p-1.5 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">
                        بحث بالبيان:
                      </label>
                      <input
                        type="text"
                        placeholder="اكتب للبحث..."
                        value={projFilterDesc}
                        onChange={(e) => setProjFilterDesc(e.target.value)}
                        className="w-full border p-1.5 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">
                        منشئ السجل:
                      </label>
                      <input
                        type="text"
                        placeholder="اسم المستخدم..."
                        value={projFilterCreator}
                        onChange={(e) => setProjFilterCreator(e.target.value)}
                        className="w-full border p-1.5 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2">
                    سجل الحركات والمصاريف:
                  </h4>
                  <div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-2">
                    {transactionsList.filter((t) => {
                      if (t.project !== selectedProjectForDetails.name)
                        return false;
                      if (projFilterStart && t.date < projFilterStart)
                        return false;
                      if (projFilterEnd && t.date > projFilterEnd) return false;
                      if (projFilterDesc && !t.desc.includes(projFilterDesc))
                        return false;
                      if (
                        projFilterCreator &&
                        !(t.created_by || '').includes(projFilterCreator)
                      )
                        return false;
                      return true;
                    }).length === 0 ? (
                      <p className="text-slate-400 text-center py-4">
                        لا توجد حركات مطابقة لشروط الفلتر.
                      </p>
                    ) : (
                      transactionsList
                        .filter((t) => {
                          if (t.project !== selectedProjectForDetails.name)
                            return false;
                          if (projFilterStart && t.date < projFilterStart)
                            return false;
                          if (projFilterEnd && t.date > projFilterEnd)
                            return false;
                          if (
                            projFilterDesc &&
                            !t.desc.includes(projFilterDesc)
                          )
                            return false;
                          if (
                            projFilterCreator &&
                            !(t.created_by || '').includes(projFilterCreator)
                          )
                            return false;
                          return true;
                        })
                        .map((t, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-white p-2.5 rounded-lg border"
                          >
                            <div>
                              <span className="font-bold block text-sm">
                                {t.desc} ({t.type})
                              </span>
                              <span className="text-slate-400">
                                التاريخ: {t.date} • بواسطة:{' '}
                                <b className="text-blue-600">
                                  {t.created_by || 'مشرف'}
                                </b>{' '}
                                {t.party_name ? `• الجهة: ${t.party_name}` : ''}
                              </span>
                            </div>
                            <span
                              className={`font-bold text-sm ${
                                t.type === 'قبض'
                                  ? 'text-emerald-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {t.type === 'قبض' ? '+' : '-'}
                              {Number(t.amount).toLocaleString()}{' '}
                              {companySettings.currency}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className="border-t pt-3 space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm">
                    تسجيل حركة / مصروف جديد للمشروع:
                  </h4>
                  <form
                    onSubmit={handleSaveQuickProjectTx}
                    className="space-y-3 bg-slate-50 p-3 rounded-xl border"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        نوع وجهة الحركة / المصروف
                      </label>
                      <select
                        value={quickProjTx.partyType}
                        onChange={(e) =>
                          setQuickProjTx({
                            ...quickProjTx,
                            partyType: e.target.value,
                            partyName: '',
                          })
                        }
                        className="w-full border p-2 rounded-lg bg-white text-xs"
                      >
                        <option value="general">مصروف عام / تكلفة أخري</option>
                        <option value="subcontractor">دفع لمقاول باطن</option>
                        <option value="supplier">دفع لمورد مواد</option>
                      </select>
                    </div>

                    {quickProjTx.partyType === 'subcontractor' && (
                      <select
                        value={quickProjTx.partyName}
                        onChange={(e) =>
                          setQuickProjTx({
                            ...quickProjTx,
                            partyName: e.target.value,
                          })
                        }
                        required
                        className="w-full border p-2 rounded-lg bg-white text-xs"
                      >
                        <option value="">-- اختر مقاول الباطن --</option>
                        {subcontractorsList.map((sub, idx) => (
                          <option key={idx} value={sub.name}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {quickProjTx.partyType === 'supplier' && (
                      <select
                        value={quickProjTx.partyName}
                        onChange={(e) =>
                          setQuickProjTx({
                            ...quickProjTx,
                            partyName: e.target.value,
                          })
                        }
                        required
                        className="w-full border p-2 rounded-lg bg-white text-xs"
                      >
                        <option value="">-- اختر المورد --</option>
                        {suppliersList.map((sup, idx) => (
                          <option key={idx} value={sup.name}>
                            {sup.name}
                          </option>
                        ))}
                      </select>
                    )}

                    <input
                      type="text"
                      placeholder="بيان الحركة (مثال: دفعة للمورد للحديد)"
                      value={quickProjTx.desc}
                      onChange={(e) =>
                        setQuickProjTx({ ...quickProjTx, desc: e.target.value })
                      }
                      required
                      className="w-full border p-2 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      placeholder="المبلغ"
                      value={quickProjTx.amount}
                      onChange={(e) =>
                        setQuickProjTx({
                          ...quickProjTx,
                          amount: e.target.value,
                        })
                      }
                      required
                      className="w-full border p-2 rounded-lg text-xs"
                    />

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg shadow text-xs"
                      >
                        تسجيل وترحيل بالحساب فوراً
                      </button>
                    </div>
                  </form>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setSelectedProjectForDetails(null);
                      setProjFilterStart('');
                      setProjFilterEnd('');
                      setProjFilterDesc('');
                      setProjFilterCreator('');
                    }}
                    className="px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'project' && (
              <form onSubmit={handleSaveProject} className="space-y-3">
                <input
                  type="text"
                  placeholder="اسم المشروع"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="اسم العميل"
                  value={newProject.client}
                  onChange={(e) =>
                    setNewProject({ ...newProject, client: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="الميزانية"
                  value={newProject.budget}
                  onChange={(e) =>
                    setNewProject({ ...newProject, budget: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'editProject' && editingProject && (
              <form onSubmit={handleUpdateProject} className="space-y-3">
                <input
                  type="text"
                  placeholder="اسم المشروع"
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="اسم العميل"
                  value={editingProject.client}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      client: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="الميزانية"
                  value={editingProject.budget}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      budget: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="نسبة الإنجاز %"
                  value={editingProject.progress}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      progress: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <select
                  value={editingProject.status}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      status: e.target.value,
                    })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="قيد التنفيذ">قيد التنفيذ</option>
                  <option value="مكتمل">مكتمل</option>
                  <option value="قيد التخطيط">قيد التخطيط</option>
                </select>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setEditingProject(null);
                    }}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    تحديث
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'budgetItem' && (
              <form onSubmit={handleSaveBudgetItem} className="space-y-3">
                <select
                  value={newBudgetItem.project}
                  onChange={(e) =>
                    setNewBudgetItem({
                      ...newBudgetItem,
                      project: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="">-- اختر المشروع --</option>
                  {accessibleProjects.map((p, idx) => (
                    <option key={idx} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="كود البند (مثال: B-01)"
                  value={newBudgetItem.itemCode}
                  onChange={(e) =>
                    setNewBudgetItem({
                      ...newBudgetItem,
                      itemCode: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="اسم البند الإنشائي"
                  value={newBudgetItem.itemName}
                  onChange={(e) =>
                    setNewBudgetItem({
                      ...newBudgetItem,
                      itemName: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="التكلفة التقديرية (الميزانية)"
                  value={newBudgetItem.estimatedCost}
                  onChange={(e) =>
                    setNewBudgetItem({
                      ...newBudgetItem,
                      estimatedCost: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="التكلفة الفعلية (المصروف)"
                  value={newBudgetItem.actualCost}
                  onChange={(e) =>
                    setNewBudgetItem({
                      ...newBudgetItem,
                      actualCost: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold"
                  >
                    حفظ البند
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'transaction' && (
              <form onSubmit={handleSaveTransaction} className="space-y-3">
                <input
                  type="text"
                  placeholder="البيان / الوصف"
                  value={newTransaction.desc}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      desc: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <select
                  value={newTransaction.project}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      project: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="">-- اختر المشروع --</option>
                  {accessibleProjects.map((p, idx) => (
                    <option key={idx} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newTransaction.type}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: e.target.value,
                    })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="صرف">صرف</option>
                  <option value="قبض">قبض</option>
                </select>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    تصنيف الجهة المصروف إليها / الوارد منها
                  </label>
                  <select
                    value={newTransaction.party_type}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        party_type: e.target.value,
                        party_name: '',
                      })
                    }
                    className="w-full border p-2.5 rounded-xl text-sm bg-white"
                  >
                    <option value="general">تكلفة أخري / عام</option>
                    <option value="subcontractor">مقاول باطن</option>
                    <option value="supplier">مورد</option>
                  </select>
                </div>

                {newTransaction.party_type === 'subcontractor' && (
                  <select
                    value={newTransaction.party_name}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        party_name: e.target.value,
                      })
                    }
                    required
                    className="w-full border p-2.5 rounded-xl text-sm bg-white"
                  >
                    <option value="">-- اختر المقاول --</option>
                    {subcontractorsList
                      .filter(sub => !newTransaction.project || sub.project === 'عام / غير مرتبطة' || sub.project === newTransaction.project)
                      .map((sub, idx) => (
                        <option key={idx} value={sub.name}>
                          {sub.name} ({sub.project})
                        </option>
                      ))}
                  </select>
                )}

                {newTransaction.party_type === 'supplier' && (
                  <select
                    value={newTransaction.party_name}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        party_name: e.target.value,
                      })
                    }
                    required
                    className="w-full border p-2.5 rounded-xl text-sm bg-white"
                  >
                    <option value="">-- اختر المورد --</option>
                    {suppliersList.map((sup, idx) => (
                      <option key={idx} value={sup.name}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                )}

                <input
                  type="number"
                  placeholder="المبلغ"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'supplier' && (
              <form onSubmit={handleSaveSupplier} className="space-y-3">
                <input
                  type="text"
                  placeholder="اسم المورد"
                  value={newSupplier.name}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="التخصص"
                  value={newSupplier.spec}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, spec: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="رقم الهاتف"
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="المشتريات"
                  value={newSupplier.purchases}
                  onChange={(e) =>
                    setNewSupplier({
                      ...newSupplier,
                      purchases: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="المستحق"
                  value={newSupplier.due}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, due: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'editSupplier' && editingSupplier && (
              <form onSubmit={handleUpdateSupplier} className="space-y-3">
                <input
                  type="text"
                  placeholder="اسم المورد"
                  value={editingSupplier.name}
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="التخصص"
                  value={editingSupplier.spec}
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
                      spec: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="الهاتف"
                  value={editingSupplier.phone}
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
                      phone: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="المشتريات"
                  value={editingSupplier.purchases}
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
                      purchases: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="المستحق"
                  value={editingSupplier.due}
                  onChange={(e) =>
                    setEditingSupplier({
                      ...editingSupplier,
                      due: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setEditingSupplier(null);
                    }}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    تحديث
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'subcontractor' && (
              <form onSubmit={handleSaveSubcontractor} className="space-y-3">
                <input
                  type="text"
                  placeholder="اسم مقاول الباطن"
                  value={newSubcontractor.name}
                  onChange={(e) =>
                    setNewSubcontractor({
                      ...newSubcontractor,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="التخصص"
                  value={newSubcontractor.spec}
                  onChange={(e) =>
                    setNewSubcontractor({
                      ...newSubcontractor,
                      spec: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <select
                  value={newSubcontractor.project}
                  onChange={(e) =>
                    setNewSubcontractor({
                      ...newSubcontractor,
                      project: e.target.value,
                    })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="">-- بدون مشروع محدد / عام --</option>
                  {accessibleProjects.map((p, idx) => (
                    <option key={idx} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="قيمة العقد"
                  value={newSubcontractor.contract}
                  onChange={(e) =>
                    setNewSubcontractor({
                      ...newSubcontractor,
                      contract: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'editSubcontractor' && editingSubcontractor && (
              <form onSubmit={handleUpdateSubcontractor} className="space-y-3">
                <input
                  type="text"
                  placeholder="اسم المقاول"
                  value={editingSubcontractor.name}
                  onChange={(e) =>
                    setEditingSubcontractor({
                      ...editingSubcontractor,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="التخصص"
                  value={editingSubcontractor.spec}
                  onChange={(e) =>
                    setEditingSubcontractor({
                      ...editingSubcontractor,
                      spec: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <select
                  value={editingSubcontractor.project}
                  onChange={(e) =>
                    setEditingSubcontractor({
                      ...editingSubcontractor,
                      project: e.target.value,
                    })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="">-- بدون مشروع محدد / عام --</option>
                  {accessibleProjects.map((p, idx) => (
                    <option key={idx} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="قيمة العقد"
                  value={editingSubcontractor.contract}
                  onChange={(e) =>
                    setEditingSubcontractor({
                      ...editingSubcontractor,
                      contract: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setEditingSubcontractor(null);
                    }}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    تحديث
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'employee' && (
              <form onSubmit={handleSaveEmployee} className="space-y-3">
                <input
                  type="text"
                  placeholder="اسم الموظف"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="الوظيفة"
                  value={newEmployee.role}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, role: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="المشروع"
                  value={newEmployee.project}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, project: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="الراتب الأساسي"
                  value={newEmployee.salary}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, salary: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'editEmployee' && editingEmployee && (
              <form onSubmit={handleUpdateEmployee} className="space-y-3">
                <input
                  type="text"
                  placeholder="اسم الموظف"
                  value={editingEmployee.name}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="الوظيفة"
                  value={editingEmployee.role}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      role: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="المشروع"
                  value={editingEmployee.project}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      project: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="الراتب الأساسي"
                  value={editingEmployee.salary}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      salary: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setEditingEmployee(null);
                    }}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    تحديث
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'custody' && (
              <form onSubmit={handleSaveCustody} className="space-y-3">
                <select
                  value={newCustody.name}
                  onChange={(e) =>
                    setNewCustody({ ...newCustody, name: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="">-- اختر مستلم العهدة (الموظف) --</option>
                  {employeesList.map((emp, idx) => (
                    <option key={idx} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newCustody.project}
                  onChange={(e) =>
                    setNewCustody({ ...newCustody, project: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="">-- المشروع المرتبط --</option>
                  {accessibleProjects.map((p, idx) => (
                    <option key={idx} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="قيمة العهدة"
                  value={newCustody.amount}
                  onChange={(e) =>
                    setNewCustody({ ...newCustody, amount: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    تخصيص
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'custodyExpense' && (
              <form onSubmit={handleSaveCustodyExpense} className="space-y-3">
                <select
                  value={newCustodyExpense.custodyId}
                  onChange={(e) =>
                    setNewCustodyExpense({
                      ...newCustodyExpense,
                      custodyId: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="">-- اختر العهدة --</option>
                  {custodyList.map((c, idx) => (
                    <option key={idx} value={c.name}>
                      {c.name} ({c.project})
                    </option>
                  ))}
                </select>
                <select
                  value={newCustodyExpense.partyType}
                  onChange={(e) =>
                    setNewCustodyExpense({
                      ...newCustodyExpense,
                      partyType: e.target.value,
                    })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="general">تكلفة أخري / عام</option>
                  <option value="subcontractor">مقاول باطن</option>
                  <option value="supplier">مورد</option>
                </select>
                {newCustodyExpense.partyType === 'subcontractor' && (
                  <select
                    value={newCustodyExpense.partyName}
                    onChange={(e) =>
                      setNewCustodyExpense({
                        ...newCustodyExpense,
                        partyName: e.target.value,
                      })
                    }
                    required
                    className="w-full border p-2.5 rounded-xl text-sm bg-white"
                  >
                    <option value="">-- اختر المقاول --</option>
                    {subcontractorsList.map((sub, idx) => (
                      <option key={idx} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                )}
                {newCustodyExpense.partyType === 'supplier' && (
                  <select
                    value={newCustodyExpense.partyName}
                    onChange={(e) =>
                      setNewCustodyExpense({
                        ...newCustodyExpense,
                        partyName: e.target.value,
                      })
                    }
                    required
                    className="w-full border p-2.5 rounded-xl text-sm bg-white"
                  >
                    <option value="">-- اختر المورد --</option>
                    {suppliersList.map((sup, idx) => (
                      <option key={idx} value={sup.name}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  placeholder="بيان المصروف"
                  value={newCustodyExpense.desc}
                  onChange={(e) =>
                    setNewCustodyExpense({
                      ...newCustodyExpense,
                      desc: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="المبلغ"
                  value={newCustodyExpense.amount}
                  onChange={(e) =>
                    setNewCustodyExpense({
                      ...newCustodyExpense,
                      amount: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold"
                  >
                    إرسال للاعتماد
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'custodyReport' && selectedCustodyForReport && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border space-y-1 text-xs">
                  <p>
                    <b>مدير المشروع:</b> {selectedCustodyForReport.name}
                  </p>
                  <p>
                    <b>المشروع:</b> {selectedCustodyForReport.project}
                  </p>
                  <p>
                    <b>إجمالي العهدة المجمعة:</b>{' '}
                    {parseFloat(
                      selectedCustodyForReport.amount || 0
                    ).toLocaleString()}{' '}
                    {companySettings.currency}
                  </p>
                  <p className="text-red-600 font-semibold">
                    <b>إجمالي المصروف (المعتمد):</b>{' '}
                    {parseFloat(
                      selectedCustodyForReport.spent || 0
                    ).toLocaleString()}{' '}
                    {companySettings.currency}
                  </p>
                  <p className="text-emerald-600 font-bold text-sm">
                    <b>صافي الرصيد المتبقي:</b>{' '}
                    {(
                      parseFloat(selectedCustodyForReport.amount || 0) -
                      parseFloat(selectedCustodyForReport.spent || 0)
                    ).toLocaleString()}{' '}
                    {companySettings.currency}
                  </p>
                </div>

                <div className="bg-slate-100 p-3 rounded-xl border space-y-2">
                  <div className="font-bold text-slate-700 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> فلاتر كشف العهدة:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">
                        من تاريخ:
                      </label>
                      <input
                        type="date"
                        value={custodyFilterStart}
                        onChange={(e) => setCustodyFilterStart(e.target.value)}
                        className="w-full border p-1 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">
                        إلى تاريخ:
                      </label>
                      <input
                        type="date"
                        value={custodyFilterEnd}
                        onChange={(e) => setCustodyFilterEnd(e.target.value)}
                        className="w-full border p-1 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">
                        الجهة المصروف إليها:
                      </label>
                      <input
                        type="text"
                        placeholder="اسم المورد أو المقاول..."
                        value={custodyFilterParty}
                        onChange={(e) => setCustodyFilterParty(e.target.value)}
                        className="w-full border p-1 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border rounded-xl p-2 space-y-2 text-xs">
                  {custodyTransactionsList.filter((tx) => {
                    if (tx.custody_name !== selectedCustodyForReport.name)
                      return false;
                    if (custodyFilterStart && tx.date < custodyFilterStart)
                      return false;
                    if (custodyFilterEnd && tx.date > custodyFilterEnd)
                      return false;
                    if (
                      custodyFilterParty &&
                      !(tx.party_name || '').includes(custodyFilterParty)
                    )
                      return false;
                    return true;
                  }).length === 0 ? (
                    <p className="text-slate-400 text-center py-4">
                      لا توجد بنود عهدة مطابقة لشروط الفلتر.
                    </p>
                  ) : (
                    custodyTransactionsList
                      .filter((tx) => {
                        if (tx.custody_name !== selectedCustodyForReport.name)
                          return false;
                        if (custodyFilterStart && tx.date < custodyFilterStart)
                          return false;
                        if (custodyFilterEnd && tx.date > custodyFilterEnd)
                          return false;
                        if (
                          custodyFilterParty &&
                          !(tx.party_name || '').includes(custodyFilterParty)
                        )
                          return false;
                        return true;
                      })
                      .map((tx, i) => (
                        <div
                          key={i}
                          className={`flex justify-between items-center p-2.5 rounded-lg border ${
                            tx.type === 'addition'
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-white'
                          }`}
                        >
                          <div>
                            <span className="font-bold block">
                              {tx.desc}{' '}
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded">
                                ({tx.status})
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              التاريخ: {tx.date}{' '}
                              {tx.party_name ? `• الجهة: ${tx.party_name}` : ''}{' '}
                              • بواسطة: {tx.created_by}
                            </span>
                          </div>
                          <span
                            className={`font-bold ${
                              tx.type === 'addition'
                                ? 'text-emerald-700'
                                : 'text-red-600'
                            }`}
                          >
                            {tx.type === 'addition' ? '+' : '-'}
                            {parseFloat(tx.amount || 0).toLocaleString()}{' '}
                            {companySettings.currency}
                          </span>
                        </div>
                      ))
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setSelectedCustodyForReport(null);
                      setCustodyFilterStart('');
                      setCustodyFilterEnd('');
                      setCustodyFilterParty('');
                    }}
                    className="px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'partyStatement' &&
              selectedPartyForAccountStatement && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border space-y-1 text-xs">
                    <p>
                      <b>
                        الجهة (
                        {selectedPartyForAccountStatement.type === 'supplier'
                          ? 'مورد مواد'
                          : 'مقاول باطن'}
                        ):
                      </b>{' '}
                      {selectedPartyForAccountStatement.name}
                    </p>
                  </div>
                  <div className="max-h-48 overflow-y-auto border rounded-xl p-2 space-y-2 text-xs">
                    {transactionsList.filter(
                      (tx) =>
                        tx.party_name === selectedPartyForAccountStatement.name
                    ).length === 0 ? (
                      <p className="text-slate-400 text-center py-4">
                        لا توجد حركات مسجلة.
                      </p>
                    ) : (
                      transactionsList
                        .filter(
                          (tx) =>
                            tx.party_name ===
                            selectedPartyForAccountStatement.name
                        )
                        .map((tx, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-white p-2.5 rounded-lg border"
                          >
                            <div>
                              <span className="font-bold block">{tx.desc}</span>
                              <span className="text-[10px] text-slate-400">
                                التاريخ: {tx.date} • بواسطة: {tx.created_by}
                              </span>
                            </div>
                            <span className="font-bold text-red-600">
                              -{parseFloat(tx.amount || 0).toLocaleString()}{' '}
                              {companySettings.currency}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        setSelectedPartyForAccountStatement(null);
                      }}
                      className="px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              )}

            {activeModal === 'inventory' && (
              <form onSubmit={handleSaveInventory} className="space-y-3">
                <input
                  type="text"
                  placeholder="اسم المادة"
                  value={newInventory.name}
                  onChange={(e) =>
                    setNewInventory({ ...newInventory, name: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="الموقع / المستودع"
                  value={newInventory.location}
                  onChange={(e) =>
                    setNewInventory({
                      ...newInventory,
                      location: e.target.value,
                    })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="الكمية"
                  value={newInventory.qty}
                  onChange={(e) =>
                    setNewInventory({ ...newInventory, qty: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="وحدة القياس"
                  value={newInventory.unit}
                  onChange={(e) =>
                    setNewInventory({ ...newInventory, unit: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'equipment' && (
              <form onSubmit={handleSaveEquipment} className="space-y-3">
                <input
                  type="text"
                  placeholder="اسم المعدة"
                  value={newEquipment.name}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, name: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <input
                  type="text"
                  placeholder="الموقع"
                  value={newEquipment.site}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, site: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <select
                  value={newEquipment.status}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, status: e.target.value })
                  }
                  className="w-full border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="يعمل بالموقع">يعمل بالموقع</option>
                  <option value="تحت الصيانة">تحت الصيانة</option>
                  <option value="جاهز بالورشة">جاهز بالورشة</option>
                </select>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'user' && (
              <form onSubmit={handleSaveUser} className="space-y-4">
                <input
                  type="text"
                  placeholder="اسم المستخدم"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="اسم الدخول"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    required
                    className="border p-2.5 rounded-xl text-sm"
                  />
                  <input
                    type="text"
                    placeholder="كلمة المرور"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                    className="border p-2.5 rounded-xl text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="الدور الوظيفي"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  required
                  className="w-full border p-2.5 rounded-xl text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            )}

            {/* تعديل الصلاحيات والمشاريع للمستخدم */}
            {activeModal === 'editUser' && editingUser && (
              <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
                <p className="font-bold text-slate-800 text-sm">
                  تعديل الصلاحيات والمشاريع للمستخدم: {editingUser.name}
                </p>

                <div className="space-y-2 border p-3 rounded-xl bg-slate-50">
                  <p className="font-bold text-slate-700">
                    المشاريع المسموح للمستخدم الاطلاع والتعامل عليها:
                  </p>
                  <div className="max-h-28 overflow-y-auto space-y-1 bg-white p-2 border rounded-lg">
                    {projectsList.map((p, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            editingUser.permissions?.allowedProjects?.includes(
                              p.name
                            ) || false
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            let currentArr =
                              editingUser.permissions?.allowedProjects || [];
                            if (checked) currentArr.push(p.name);
                            else
                              currentArr = currentArr.filter(
                                (name) => name !== p.name
                              );
                            setEditingUser({
                              ...editingUser,
                              permissions: {
                                ...editingUser.permissions,
                                allowedProjects: currentArr,
                              },
                            });
                          }}
                        />
                        <span>{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border p-3 rounded-xl bg-slate-50">
                  <p className="font-bold text-slate-700">
                    صلاحيات الأقسام وأزرار العهد:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'projects', label: 'إدارة المشاريع' },
                      { key: 'budget', label: 'ميزانية البنود' },
                      { key: 'finance', label: 'الحسابات والمالية' },
                      { key: 'suppliers', label: 'الموردين' },
                      { key: 'subcontractors', label: 'مقاولو الباطن' },
                      { key: 'inventory', label: 'المستودعات' },
                      { key: 'equipment', label: 'المعدات' },
                      { key: 'hr', label: 'الموارد البشرية' },
                    ].map((mod) => (
                      <label
                        key={mod.key}
                        className="flex items-center gap-2 cursor-pointer font-medium bg-white p-2 border rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={
                            editingUser.permissions?.[mod.key]?.view !== false
                          }
                          onChange={(e) => {
                            setEditingUser({
                              ...editingUser,
                              permissions: {
                                ...editingUser.permissions,
                                [mod.key]: {
                                  ...(editingUser.permissions?.[mod.key] || {}),
                                  view: e.target.checked,
                                },
                              },
                            });
                          }}
                        />
                        <span>عرض {mod.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2 space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold bg-white p-2 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={
                          editingUser.permissions?.custody?.allocate !== false
                        }
                        onChange={(e) => {
                          setEditingUser({
                            ...editingUser,
                            permissions: {
                              ...editingUser.permissions,
                              custody: {
                                ...(editingUser.permissions?.custody || {}),
                                allocate: e.target.checked,
                              },
                            },
                          });
                        }}
                      />
                      <span>صلاحية تخصيص عهدة جديدة</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold bg-white p-2 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={
                          editingUser.permissions?.custody?.approve !== false
                        }
                        onChange={(e) => {
                          setEditingUser({
                            ...editingUser,
                            permissions: {
                              ...editingUser.permissions,
                              custody: {
                                ...(editingUser.permissions?.custody || {}),
                                approve: e.target.checked,
                              },
                            },
                          });
                        }}
                      />
                      <span>صلاحية اعتماد وخصم المصروفات</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    تحديث الصلاحيات
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed bottom-5 left-5 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 border text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}