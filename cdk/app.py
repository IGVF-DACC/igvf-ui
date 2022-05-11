import aws_cdk as cdk

from infrastructure.naming import prepend_branch_name
from infrastructure.naming import prepend_project_name

from infrastructure.stacks.frontend import FrontendStack

from shared_infrastructure.igvf_dev.environment import US_WEST_2


app = cdk.App()


branch = app.node.try_get_context('branch')


FrontendStack(
    app,
    prepend_project_name(
        prepend_branch_name(
            branch,
            'FrontendStack',
        )
    ),
    branch=branch,
    env=US_WEST_2,
)

app.synth()
