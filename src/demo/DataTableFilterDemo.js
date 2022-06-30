import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';

import React, { useState, useEffect, useRef } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { CustomerService } from '../service/CustomerService';
import './DataTableFilterDemo.css';

const DataTableFilterDemo = () => {
    const column = (props) => ({
        dataType: 'text',
        sortable: true,
        filterable: true,
        sortField: props.field,
        filterField: props.field,
        groupField: props.field,
        ...props
    });

    const gridColumns = [
        column({ header: 'Name', field: 'name' }),
        column({ header: 'Date', field: 'date', dataType: 'date', groupField: 'formattedDate' }),
        column({ header: 'Balance', field: 'balance', dataType: 'currency' }),
        column({ header: 'Status', field: 'status', dataType: 'status' }),
        column({ header: 'Verified', field: 'verified', dataType: 'boolean' })
    ]

    const [customers, setCustomers] = useState(null);
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedColumns, setSelectedColumns] = useState(gridColumns);
    const [groupBy, setGroupBy] = useState();
    const [sortField, setSortField] = useState();
    const [sortOrder, setSortOrder] = useState();
    const [expandedRows, setExpandedRows] = useState([]);
    const gridRef = useRef(null);

    const statuses = [
        'unqualified', 'qualified', 'new', 'negotiation', 'renewal', 'proposal'
    ];

    const customerService = new CustomerService();

    useEffect(() => {
        customerService.getCustomersLarge().then(data => { setCustomers(getCustomers(data)); setLoading(false) });
        initFilters();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const getCustomers = (data) => {
        return [...data || []].map(d => {
            d.date = new Date(d.date);
            return d;
        });
    }

    const formatDate = (value) => {
        return value.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    const clearFilter = () => {
        initFilters();
    }

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    }

    const onSort = (e) => {
        setSortField(e.sortField);
        setSortOrder(e.sortOrder);
    }

    const onColumnToggle = (event) => {
        const orderedSelectedColumns = gridColumns.filter(col => event.value.some(v => col.header === v.header));
        setSelectedColumns(orderedSelectedColumns);
    }

    const onGroupSelect = (e) => {
        setSortField(e.value.sortField);
        setSortOrder(1);
        setGroupBy(e.value);
        gridRef.current.reset();
    }

    const initFilters = () => {
        setFilters({
            'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
            'name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            'country.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            'representative': { value: null, matchMode: FilterMatchMode.IN },
            'date': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
            'balance': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            'status': { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            'verified': { value: null, matchMode: FilterMatchMode.EQUALS }
        });
        setGlobalFilterValue('');
    }

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <div>
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" className="p-button-outlined" onClick={clearFilter} />
                    <MultiSelect value={selectedColumns} options={gridColumns} optionLabel="header" onChange={onColumnToggle} display='chip' style={{width:'20em', margin: '0 5px'}} placeholder="Select display columns" />
                    <Dropdown value={groupBy} options={gridColumns} optionLabel="header" onChange={onGroupSelect} placeholder="Select column to group by" showClear />
                </div>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </span>
            </div>
        )
    }

    const dateBodyTemplate = (rowData) => {
        return formatDate(rowData.date);
    }

    const dateFilterTemplate = (options) => {
        return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />
    }

    const currencyBodyTemplate = (rowData) => {
        return formatCurrency(rowData.balance);
    }

    const currencyFilterTemplate = (options) => {
        return <InputNumber value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} mode="currency" currency="USD" locale="en-US" />
    }

    const statusBodyTemplate = (rowData) => {
        return <span className="customer-badge">{rowData.status}</span>;
    }

    const statusItemTemplate = (option) => {
        return <span className="customer-badge">{option}</span>;
    }

    const statusFilterTemplate = (options) => {
        return <Dropdown value={options.value} options={statuses} onChange={(e) => options.filterCallback(e.value, options.index)} itemTemplate={statusItemTemplate} placeholder="Select a Status" className="p-column-filter" showClear />;
    }

    const boolBodyTemplate = (rowData) => {
        return <span>{rowData.verified ? 'Yes' : 'No'}</span>
    }

    const boolFilterTemplate = (options) => {
        return <TriStateCheckbox value={options.value} onChange={(e) => options.filterCallback(e.value)} />
    }

    const columnBody = (rowData, field) => {
        const gridColumn = gridColumns.find(c => c.field === field);

        if (gridColumn.dataType === 'date') {
            return dateBodyTemplate(rowData);
        }

        if (gridColumn.dataType === 'currency') {
            return currencyBodyTemplate(rowData);
        }

        if (gridColumn.dataType === 'status') {
            return statusBodyTemplate(rowData);
        }

        if (gridColumn.dataType === 'boolean') {
            return boolBodyTemplate(rowData);
        }

        return rowData[field];
    }

    const columnFilterElement = (options, field) => {
        const gridColumn = gridColumns.find(c => c.field === field);

        if (gridColumn.dataType === 'date') {
            return dateFilterTemplate(options);
        }

        if (gridColumn.dataType === 'currency') {
            return currencyFilterTemplate(options);
        }

        if (gridColumn.dataType === 'status') {
            return statusFilterTemplate(options);
        }

        if (gridColumn.dataType === 'boolean') {
            return boolFilterTemplate(options);
        }

        return null;
    }

    const header = renderHeader();

    const columns = selectedColumns.map(col => {
        let dataType =
            col.dataType === 'currency' ? 'numeric' :
            col.dataType === 'status' ? 'text' :
            col.dataType;

        return <Column
            key={col.field} field={col.field} header={col.header} dataType={dataType} body={(data) => columnBody(data, col.field)}
            sortable={col.sortable} sortField={col.sortField} sortableDisabled={!!groupBy && groupBy.field !== col.field}
            filter={col.filterable} filterField={col.filterField} filterElement={(options) => columnFilterElement(options, col.field)}  />;
    });

    const virtualScrollerOptions = !groupBy ? { itemSize: 50 } : undefined;
    const rowGroupMode = groupBy ? "subheader": undefined;
    const rowGroupHeaderTemplate = !!groupBy ? ((data) => columnBody(data, groupBy.field)) : undefined; 

    return (
        <div className="datatable-filter-demo">
            <div className="card">
                <h5>Filter Menu</h5>
                <p>Filters are displayed in an overlay.</p>
                <DataTable ref={gridRef} value={customers} className="p-datatable-customers" showGridlines scrollable scrollHeight="75vh" virtualScrollerOptions={virtualScrollerOptions}
                    dataKey="id" sortField={sortField} sortOrder={sortOrder} onSort={onSort} filters={filters} filterDisplay="menu" loading={loading} responsiveLayout="scroll"
                    globalFilterFields={['name', 'country.name', 'representative.name', 'balance', 'status']} header={header} emptyMessage="No customers found."
                    rowGroupMode={rowGroupMode} groupRowsBy={groupBy?.groupField} rowGroupHeaderTemplate={rowGroupHeaderTemplate} expandableRowGroups={!!groupBy} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}>

                    {columns}
                </DataTable>
            </div>
        </div>
    );
}
                
export default DataTableFilterDemo;