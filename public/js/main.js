
/* ---------------------------
                fetch('/columns/createColumn/67a25383dacdda28699ff3fc', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: columnName }), // Send the captured value
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    // Handle the response
                })
                .catch((error) => {
                    console.error('Error:', error);
                });


                
                // console.log(columnContent)

                createProfile: async (req, res) => {
                    try {
                        const { name, description, startDate, endDate, status } = req.body;
                        const newProject = new Project({
                            user: req.user.id,
                            name,
                            description,
                            startDate,
                            endDate,
                            status,
                        });
                        await newProject.save();
                        res.redirect("/profile", { isAuthenticated: req.isAuthenticated() });
                    } catch (err) {
                        console.error(err);
                        res.status(500).send("Server Error");
                    }
                },
            
                deleteProject: async (req, res) => {
                    try {
                        await Project.findByIdAndDelete(req.params.id);
                        res.json({ success: true });
                    } catch (err) {
                        console.error(err);
                        res.status(500).json({ success: false, message: 'Server Error' });
                    }
                }
            };
             updateProject: async (req, res) => {
        try {
            const { name, description, startDate, endDate, status } = req.body;
            await Project.findByIdAndUpdate(req.params.id, {
                name,
                description,
                startDate,
                endDate,
                status
            });
            res.redirect('/projects');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    },
 ---------------------------*/