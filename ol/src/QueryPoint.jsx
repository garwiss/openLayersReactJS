import { jsPanel } from '../node_modules/jspanel4/es6module/jspanel.min.js';


 
export const QueryPoint = async () => {
    const response = await fetch('https://localhost:7196/api/Door');
    const data = await response.json();
    console.log(data);
    jsPanel.create({
        theme: 'dark',

        panelSize: {
            width: 800,
            height: 400
        },
        content: `
        <div className="panel-content">
        <table id="example" class="table table-striped" style="width:100%">
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>X</th>
                <th>Y</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${data.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.x}</td>
                    <td>${item.y}</td>
                    <td>
                        <div>
                            <button class="btn btn-primary">Button 1</button>
                            <button class="btn btn-secondary">Button 2</button>
                        </div>
                        </td>
                </tr>
            `).join('')}
        </tbody>
        </table> 
        </div>
`,
    });
};

